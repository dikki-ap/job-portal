using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostBySlug;

public class GetJobPostBySlugQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    IMemoryCache cache,
    ILogger<GetJobPostBySlugQueryHandler> logger)
    : IRequestHandler<GetJobPostBySlugQuery, JobPostDto?>
{
    public async Task<JobPostDto?> Handle(GetJobPostBySlugQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKeys.JobSlug(request.Slug);
        if (cache.TryGetValue(cacheKey, out JobPostDto? cached))
            return cached;

        try
        {
            var jobPost = await repository.GetBySlugAsync(request.Slug, cancellationToken);
            if (jobPost is null)
            {
                // Briefly cache null to avoid DB hammering on invalid slugs
                cache.Set(cacheKey, (JobPostDto?)null, CacheEntry.Default(TimeSpan.FromMinutes(5)));
                return null;
            }

            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);
            var result = GetAllJobPostsQueryHandler.MapToDto(jobPost, globalRequired);
            cache.Set(cacheKey, result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting job post slug={Slug}", request.Slug);
            throw;
        }
    }
}
