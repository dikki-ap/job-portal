using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.ApproveJobPostStep;

public record ApproveJobPostStepCommand(int JobPostId, string? Comment) : IRequest<Unit>;
