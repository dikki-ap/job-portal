using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPendingApprovals;

public class GetPendingApprovalsQueryHandler(
    IJobApprovalRepository approvalRepository,
    ICurrentUserService currentUserService,
    ILogger<GetPendingApprovalsQueryHandler> logger)
    : IRequestHandler<GetPendingApprovalsQuery, IEnumerable<PendingApprovalDto>>
{
    public async Task<IEnumerable<PendingApprovalDto>> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var email = currentUserService.GetCurrentUserEmail() ?? string.Empty;
            var instances = await approvalRepository.GetPendingInstancesForApproverAsync(email, cancellationToken);

            return instances.Select(i => new PendingApprovalDto(
                i.JobPostId,
                i.JobPost?.Title ?? string.Empty,
                i.JobPost?.Department?.Name ?? string.Empty,
                i.CurrentStepOrder,
                i.Steps.Count,
                i.StartedAt));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting pending approvals for current user");
            throw;
        }
    }
}
