using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.DeleteJobPost;

public class DeleteJobPostCommandHandler(
    IJobPostRepository repository,
    ILogger<DeleteJobPostCommandHandler> logger)
    : IRequestHandler<DeleteJobPostCommand, Unit>
{
    public async Task<Unit> Handle(DeleteJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.Id} not found.");

            await repository.DeleteAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting job post id={Id}", request.Id);
            throw;
        }
    }
}
