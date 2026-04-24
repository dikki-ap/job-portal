using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.CancelJobPostApproval;

public class CancelJobPostApprovalCommandHandler(
    IJobPostRepository jobPostRepository,
    IJobApprovalRepository approvalRepository,
    ICurrentUserService currentUserService,
    ILogger<CancelJobPostApprovalCommandHandler> logger)
    : IRequestHandler<CancelJobPostApprovalCommand, Unit>
{
    public async Task<Unit> Handle(CancelJobPostApprovalCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var job = await jobPostRepository.GetByIdAsync(request.JobPostId, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.JobPostId} not found.");

            if (job.Status != JobPostStatus.PendingApproval)
                throw new InvalidOperationException("Only job posts with Pending Approval status can have their approval cancelled.");

            var instance = await approvalRepository.GetActiveInstanceByJobPostIdAsync(request.JobPostId, cancellationToken)
                ?? throw new InvalidOperationException("No active approval process found for this job post.");

            var now = DateTime.UtcNow;

            instance.Status = "Cancelled";
            instance.CompletedAt = now;

            job.Status = JobPostStatus.Draft;
            job.UpdatedAt = now;
            job.UpdatedByUserId = currentUserService.GetCurrentUserId();

            await jobPostRepository.UpdateAsync(job, cancellationToken);
            await approvalRepository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("JobPost id={JobPostId} approval cancelled, reset to Draft", request.JobPostId);

            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error cancelling approval for job post id={JobPostId}", request.JobPostId);
            throw;
        }
    }
}
