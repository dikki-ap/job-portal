using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPendingApprovals;

public record GetPendingApprovalsQuery : IRequest<IEnumerable<PendingApprovalDto>>;
