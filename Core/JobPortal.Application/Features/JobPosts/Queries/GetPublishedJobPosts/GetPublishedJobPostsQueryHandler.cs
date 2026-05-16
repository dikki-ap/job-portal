using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedJobPosts;

public class GetPublishedJobPostsQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    IMemoryCache cache,
    ILogger<GetPublishedJobPostsQueryHandler> logger)
    : IRequestHandler<GetPublishedJobPostsQuery, PagedResult<JobPostDto>>
{
    public async Task<PagedResult<JobPostDto>> Handle(GetPublishedJobPostsQuery request, CancellationToken cancellationToken)
    {
        var version = cache.GetOrCreate(CacheKeys.PublishedJobsVersion, e =>
        {
            e.SetPriority(CacheItemPriority.NeverRemove);
            e.SetSize(0);
            return 0L;
        });

        var cats      = string.Join(",", (request.CategoryIds      ?? []).OrderBy(x => x));
        var emps      = string.Join(",", (request.EmploymentTypeIds ?? []).OrderBy(x => x));
        var modes     = string.Join(",", (request.WorkModeIds       ?? []).OrderBy(x => x));
        var countries = string.Join(",", (request.Countries         ?? []).OrderBy(x => x));
        var cacheKey  = $"cache:published-jobs:v{version}:{request.Page}:{request.PageSize}:{request.Search}:{cats}:{emps}:{modes}:{countries}";

        if (cache.TryGetValue(cacheKey, out PagedResult<JobPostDto>? cached) && cached is not null)
            return cached;

        try
        {
            var (items, totalCount) = await repository.GetPublishedPagedAsync(
                request.Search, request.CategoryIds, request.EmploymentTypeIds, request.WorkModeIds,
                request.Countries, request.Page, request.PageSize, cancellationToken);
            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
            var dtos = items.Select(j => GetAllJobPostsQueryHandler.MapToDto(j, globalRequired)).ToList();

            var result = new PagedResult<JobPostDto>(dtos, totalCount, request.Page, request.PageSize, totalPages);
            cache.Set(cacheKey, result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting published job posts");
            throw;
        }
    }
}
