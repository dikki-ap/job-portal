using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.CloseJobPost;

public class CloseJobPostCommandHandler(
    IJobPostRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CloseJobPostCommandHandler> logger)
    : IRequestHandler<CloseJobPostCommand, Unit>
{
    public async Task<Unit> Handle(CloseJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.Id} not found.");

            if (jobPost.Status != JobPostStatus.Published)
                throw new InvalidOperationException("Only Published job posts can be closed.");

            jobPost.Status = JobPostStatus.Closed;
            jobPost.UpdatedAt = DateTime.UtcNow;
            jobPost.UpdatedByUserId = currentUserService.GetCurrentUserId();

            await repository.UpdateAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error closing job post id={Id}", request.Id);
            throw;
        }
    }
}
