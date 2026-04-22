using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.CloseJobPost;

public record CloseJobPostCommand(int Id) : IRequest<Unit>;
