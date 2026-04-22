using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.PublishJobPost;

public record PublishJobPostCommand(int Id) : IRequest<Unit>;
