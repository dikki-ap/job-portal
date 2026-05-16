using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Queries.GetAllEducationLevels;

public class GetAllEducationLevelsQueryHandler(
    IEducationLevelRepository repository,
    IMemoryCache cache,
    ILogger<GetAllEducationLevelsQueryHandler> logger)
    : IRequestHandler<GetAllEducationLevelsQuery, IEnumerable<EducationLevelDto>>
{
    public async Task<IEnumerable<EducationLevelDto>> Handle(GetAllEducationLevelsQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.EducationLevels, out IEnumerable<EducationLevelDto>? cached) && cached is not null)
            return cached;

        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            var result = items.Select(e => new EducationLevelDto(
                e.Id, e.Name, e.Level, e.CreatedAt, e.CreatedByUserId,
                e.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                e.UpdatedAt, e.UpdatedByUserId,
                e.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.EducationLevels, (IEnumerable<EducationLevelDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all education levels");
            throw;
        }
    }
}
