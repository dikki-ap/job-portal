using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.PublishJobPost;

public class PublishJobPostCommandHandler(
    IJobPostRepository repository,
    ICurrentUserService currentUserService,
    ILogger<PublishJobPostCommandHandler> logger)
    : IRequestHandler<PublishJobPostCommand, Unit>
{
    public async Task<Unit> Handle(PublishJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.Id} not found.");

            if (jobPost.Status != JobPostStatus.Draft)
                throw new InvalidOperationException("Only Draft job posts can be published.");

            jobPost.Status = JobPostStatus.Published;
            jobPost.PublishDate ??= DateTime.UtcNow;
            jobPost.UpdatedAt = DateTime.UtcNow;
            jobPost.UpdatedByUserId = currentUserService.GetCurrentUserId();

            await repository.UpdateAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error publishing job post id={Id}", request.Id);
            throw;
        }
    }
}
