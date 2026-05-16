using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Queries.GetAllEmploymentTypes;

public class GetAllEmploymentTypesQueryHandler(
    IEmploymentTypeRepository repository,
    IMemoryCache cache,
    ILogger<GetAllEmploymentTypesQueryHandler> logger)
    : IRequestHandler<GetAllEmploymentTypesQuery, IEnumerable<EmploymentTypeDto>>
{
    public async Task<IEnumerable<EmploymentTypeDto>> Handle(GetAllEmploymentTypesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.EmploymentTypes, out IEnumerable<EmploymentTypeDto>? cached) && cached is not null)
            return cached;

        try
        {
            var employmentTypes = await repository.GetAllAsync(cancellationToken);
            var result = employmentTypes.Select(e => new EmploymentTypeDto(
                e.Id, e.Name, e.CreatedAt, e.CreatedByUserId,
                e.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                e.UpdatedAt, e.UpdatedByUserId,
                e.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.EmploymentTypes, (IEnumerable<EmploymentTypeDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all employment types");
            throw;
        }
    }
}
