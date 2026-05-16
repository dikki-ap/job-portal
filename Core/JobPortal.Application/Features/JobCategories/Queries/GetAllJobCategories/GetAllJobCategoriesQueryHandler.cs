using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobCategories.Queries.GetAllJobCategories;

public class GetAllJobCategoriesQueryHandler(
    IJobCategoryRepository repository,
    IMemoryCache cache,
    ILogger<GetAllJobCategoriesQueryHandler> logger)
    : IRequestHandler<GetAllJobCategoriesQuery, IEnumerable<JobCategoryDto>>
{
    public async Task<IEnumerable<JobCategoryDto>> Handle(GetAllJobCategoriesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.JobCategories, out IEnumerable<JobCategoryDto>? cached) && cached is not null)
            return cached;

        try
        {
            var jobCategories = await repository.GetAllAsync(cancellationToken);
            var result = jobCategories.Select(j => new JobCategoryDto(
                j.Id, j.Name, j.CreatedAt, j.CreatedByUserId,
                j.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                j.UpdatedAt, j.UpdatedByUserId,
                j.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.JobCategories, (IEnumerable<JobCategoryDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all job categories");
            throw;
        }
    }
}
