using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.RejectJobPostStep;

public class RejectJobPostStepCommandHandler(
    IJobPostRepository jobPostRepository,
    IJobApprovalRepository approvalRepository,
    ICurrentUserService currentUserService,
    ILogger<RejectJobPostStepCommandHandler> logger)
    : IRequestHandler<RejectJobPostStepCommand, Unit>
{
    public async Task<Unit> Handle(RejectJobPostStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var callerEmail = currentUserService.GetCurrentUserEmail()
                ?? throw new UnauthorizedAccessException("Email not found in token.");

            var instance = await approvalRepository.GetActiveInstanceByJobPostIdAsync(request.JobPostId, cancellationToken)
                ?? throw new InvalidOperationException("No active approval process found for this job post.");

            var currentStep = instance.Steps
                .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder)
                ?? throw new InvalidOperationException("Current approval step not found.");

            if (!string.Equals(currentStep.ApproverEmail, callerEmail, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("You are not authorized to reject this step.");

            var now = DateTime.UtcNow;
            currentStep.Status = "Rejected";
            currentStep.ActionAt = now;
            currentStep.Comment = request.Comment;

            instance.Status = "Rejected";
            instance.CompletedAt = now;

            var job = await jobPostRepository.GetByIdAsync(request.JobPostId, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.JobPostId} not found.");

            job.Status = JobPostStatus.Rejected;
            job.UpdatedAt = now;
            job.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await jobPostRepository.UpdateAsync(job, cancellationToken);

            await approvalRepository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("JobPost id={JobPostId} step={StepOrder} rejected by {Email}",
                request.JobPostId, currentStep.StepOrder, callerEmail);

            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error rejecting step for job post id={JobPostId}", request.JobPostId);
            throw;
        }
    }
}
