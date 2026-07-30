using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.SubmitJobPostForApproval;

public class SubmitJobPostForApprovalCommandHandler(
    IJobPostRepository jobPostRepository,
    IApprovalLevelRepository approvalLevelRepository,
    IJobApprovalRepository approvalRepository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<SubmitJobPostForApprovalCommandHandler> logger)
    : IRequestHandler<SubmitJobPostForApprovalCommand, Unit>
{
    public async Task<Unit> Handle(SubmitJobPostForApprovalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var job = await jobPostRepository.GetByIdAsync(request.JobPostId, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.JobPostId} not found.");

            if (job.Status != JobPostStatus.Draft && job.Status != JobPostStatus.Rejected)
                throw new InvalidOperationException("Only Draft or Rejected job posts can be submitted for approval.");

            var levels = (await approvalLevelRepository.GetActiveOrderedAsync(cancellationToken)).ToList();
            if (levels.Count == 0)
                throw new InvalidOperationException("No active approval levels configured.");

            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId() ?? 0;
            var baseUrl = currentUserService.GetBaseUrl();

            var instance = new JobApprovalInstance
            {
                JobPostId = job.Id,
                CurrentStepOrder = levels.Min(l => l.LevelOrder),
                Status = JobApprovalStatus.InProgress,
                StartedAt = now,
                CreatedAt = now,
                CreatedByUserId = userId,
                Steps = levels.Select(l => new JobApprovalInstanceStep
                {
                    StepOrder = l.LevelOrder,
                    ApproverEmail = l.ApproverEmail,
                    ApproverName = l.ApproverName,
                    Status = JobApprovalStatus.Pending,
                }).ToList(),
            };

            job.Status = JobPostStatus.PendingApproval;
            job.UpdatedAt = now;
            job.UpdatedByUserId = userId;

            await approvalRepository.AddInstanceAsync(instance, cancellationToken);
            await jobPostRepository.UpdateAsync(job, cancellationToken);
            await approvalRepository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("JobPost id={JobPostId} submitted for approval instanceId={InstanceId}", job.Id, instance.Id);

            var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
            var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";

            // Reload instance with job nav props for email
            var reloaded = await approvalRepository.GetActiveInstanceByJobPostIdAsync(job.Id, cancellationToken);
            if (reloaded is not null)
            {
                var firstStep = reloaded.Steps.OrderBy(s => s.StepOrder).First();
                await ApprovalEmailHelper.SendApprovalEmailAsync(emailService, baseUrl, logger, reloaded, firstStep, primaryColor, companyName);
            }

            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error submitting job post id={JobPostId} for approval", request.JobPostId);
            throw;
        }
    }
}
