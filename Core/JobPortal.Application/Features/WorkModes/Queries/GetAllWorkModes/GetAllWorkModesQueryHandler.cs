using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Queries.GetAllWorkModes;

public class GetAllWorkModesQueryHandler(
    IWorkModeRepository repository,
    IMemoryCache cache,
    ILogger<GetAllWorkModesQueryHandler> logger)
    : IRequestHandler<GetAllWorkModesQuery, IEnumerable<WorkModeDto>>
{
    public async Task<IEnumerable<WorkModeDto>> Handle(GetAllWorkModesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.WorkModes, out IEnumerable<WorkModeDto>? cached) && cached is not null)
            return cached;

        try
        {
            var workModes = await repository.GetAllAsync(cancellationToken);
            var result = workModes.Select(w => new WorkModeDto(
                w.Id, w.Name, w.CreatedAt, w.CreatedByUserId,
                w.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                w.UpdatedAt, w.UpdatedByUserId,
                w.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.WorkModes, (IEnumerable<WorkModeDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all work modes");
            throw;
        }
    }
}
