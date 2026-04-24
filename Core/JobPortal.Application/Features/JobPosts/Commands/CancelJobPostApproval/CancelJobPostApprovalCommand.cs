using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.CancelJobPostApproval;

public record CancelJobPostApprovalCommand(int JobPostId) : IRequest<Unit>;
