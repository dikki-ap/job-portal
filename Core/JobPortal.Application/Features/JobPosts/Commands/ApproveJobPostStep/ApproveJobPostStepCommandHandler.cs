using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.ApproveJobPostStep;

public class ApproveJobPostStepCommandHandler(
    IJobPostRepository jobPostRepository,
    IJobApprovalRepository approvalRepository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    IMemoryCache cache,
    ILogger<ApproveJobPostStepCommandHandler> logger)
    : IRequestHandler<ApproveJobPostStepCommand, Unit>
{
    private async Task<(string PrimaryColor, string CompanyName)> GetBrandingAsync(CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.Branding, out BrandingSettingDto? branding) && branding is not null)
            return (branding.PrimaryColor, branding.CompanyName);

        var values = await appSettingRepository.GetManyAsync(
            ["BrandPrimaryColor", "BrandCompanyName"], cancellationToken);
        return (
            values.GetValueOrDefault("BrandPrimaryColor") ?? "#004181",
            values.GetValueOrDefault("BrandCompanyName")  ?? "JobPortal");
    }

    public async Task<Unit> Handle(ApproveJobPostStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var callerEmail = currentUserService.GetCurrentUserEmail()
                ?? throw new UnauthorizedAccessException("Email not found in token.");
            var baseUrl = currentUserService.GetBaseUrl();

            var instance = await approvalRepository.GetActiveInstanceByJobPostIdAsync(request.JobPostId, cancellationToken)
                ?? throw new InvalidOperationException("No active approval process found for this job post.");

            var currentStep = instance.Steps
                .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder)
                ?? throw new InvalidOperationException("Current approval step not found.");

            if (!string.Equals(currentStep.ApproverEmail, callerEmail, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("You are not authorized to approve this step.");

            var now = DateTime.UtcNow;
            currentStep.Status = JobApprovalStatus.Approved;
            currentStep.ActionAt = now;
            currentStep.Comment = request.Comment;

            var nextStep = instance.Steps
                .Where(s => s.StepOrder > instance.CurrentStepOrder)
                .OrderBy(s => s.StepOrder)
                .FirstOrDefault();

            if (nextStep is not null)
            {
                instance.CurrentStepOrder = nextStep.StepOrder;

                var (primaryColor, companyName) = await GetBrandingAsync(cancellationToken);
                await ApprovalEmailHelper.SendApprovalEmailAsync(emailService, baseUrl, logger, instance, nextStep, primaryColor, companyName);
            }
            else
            {
                instance.Status = JobApprovalStatus.Completed;
                instance.CompletedAt = now;

                var job = await jobPostRepository.GetByIdAsync(request.JobPostId, cancellationToken)
                    ?? throw new KeyNotFoundException($"Job post with ID {request.JobPostId} not found.");

                job.Status = JobPostStatus.Published;
                job.PublishDate ??= now;
                job.UpdatedAt = now;
                job.UpdatedByUserId = currentUserService.GetCurrentUserId();
                await jobPostRepository.UpdateAsync(job, cancellationToken);
                InvalidateJobsCache(job.Slug);
            }

            await approvalRepository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("JobPost id={JobPostId} step={StepOrder} approved by {Email}",
                request.JobPostId, currentStep.StepOrder, callerEmail);

            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error approving step for job post id={JobPostId}", request.JobPostId);
            throw;
        }
    }

    private void InvalidateJobsCache(string slug)
    {
        var version = cache.Get<long>(CacheKeys.PublishedJobsVersion);
        cache.Set(CacheKeys.PublishedJobsVersion, version + 1, CacheEntry.Permanent());
        cache.Remove(CacheKeys.PublishedCountries);
        cache.Remove(CacheKeys.JobSlug(slug));
    }
}
