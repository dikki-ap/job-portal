using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.RejectJobPostStep;

public record RejectJobPostStepCommand(int JobPostId, string Comment) : IRequest<Unit>;
