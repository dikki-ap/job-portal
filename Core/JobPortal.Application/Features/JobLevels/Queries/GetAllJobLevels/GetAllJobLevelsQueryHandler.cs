using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobLevels.Queries.GetAllJobLevels;

public class GetAllJobLevelsQueryHandler(
    IJobLevelRepository repository,
    IMemoryCache cache,
    ILogger<GetAllJobLevelsQueryHandler> logger)
    : IRequestHandler<GetAllJobLevelsQuery, IEnumerable<JobLevelDto>>
{
    public async Task<IEnumerable<JobLevelDto>> Handle(GetAllJobLevelsQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.JobLevels, out IEnumerable<JobLevelDto>? cached) && cached is not null)
            return cached;

        try
        {
            var jobLevels = await repository.GetAllAsync(cancellationToken);
            var result = jobLevels.Select(j => new JobLevelDto(
                j.Id, j.Name, j.CreatedAt, j.CreatedByUserId,
                j.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                j.UpdatedAt, j.UpdatedByUserId,
                j.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.JobLevels, (IEnumerable<JobLevelDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all job levels");
            throw;
        }
    }
}
