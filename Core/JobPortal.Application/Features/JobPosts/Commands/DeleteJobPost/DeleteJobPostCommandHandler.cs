using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.DeleteJobPost;

public class DeleteJobPostCommandHandler(
    IJobPostRepository repository,
    IMemoryCache cache,
    ILogger<DeleteJobPostCommandHandler> logger)
    : IRequestHandler<DeleteJobPostCommand, Unit>
{
    public async Task<Unit> Handle(DeleteJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.Id} not found.");

            var slug = jobPost.Slug;
            await repository.DeleteAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            InvalidateJobsCache(slug);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting job post id={Id}", request.Id);
            throw;
        }
    }

    private void InvalidateJobsCache(string slug)
    {
        var version = cache.Get<long>(CacheKeys.PublishedJobsVersion);
        cache.Set(CacheKeys.PublishedJobsVersion, version + 1, CacheEntry.Permanent());
        cache.Remove(CacheKeys.PublishedCountries);
        cache.Remove(CacheKeys.JobSlug(slug));
    }
}
