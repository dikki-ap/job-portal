using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.DeleteJobPost;

public record DeleteJobPostCommand(int Id) : IRequest<Unit>;
