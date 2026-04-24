using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobApprovalStatus;

public class GetJobApprovalStatusQueryHandler(
    IJobApprovalRepository approvalRepository,
    ILogger<GetJobApprovalStatusQueryHandler> logger)
    : IRequestHandler<GetJobApprovalStatusQuery, ApprovalStatusDto?>
{
    public async Task<ApprovalStatusDto?> Handle(GetJobApprovalStatusQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var instance = await approvalRepository.GetLatestInstanceByJobPostIdAsync(request.JobPostId, cancellationToken);
            if (instance is null) return null;

            var steps = instance.Steps
                .OrderBy(s => s.StepOrder)
                .Select(s => new ApprovalStepStatusDto(
                    s.StepOrder,
                    s.ApproverName,
                    s.ApproverEmail,
                    s.Status,
                    s.Comment,
                    s.ActionAt));

            return new ApprovalStatusDto(instance.Status, instance.StartedAt, instance.CompletedAt, steps);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting approval status for job post id={JobPostId}", request.JobPostId);
            throw;
        }
    }
}
