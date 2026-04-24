using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.SubmitJobPostForApproval;

public record SubmitJobPostForApprovalCommand(int JobPostId) : IRequest<Unit>;
