using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Queries.GetAllCurrencyTypes;

public class GetAllCurrencyTypesQueryHandler(
    ICurrencyTypeRepository repository,
    IMemoryCache cache,
    ILogger<GetAllCurrencyTypesQueryHandler> logger)
    : IRequestHandler<GetAllCurrencyTypesQuery, IEnumerable<CurrencyTypeDto>>
{
    public async Task<IEnumerable<CurrencyTypeDto>> Handle(GetAllCurrencyTypesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.CurrencyTypes, out IEnumerable<CurrencyTypeDto>? cached) && cached is not null)
            return cached;

        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            var result = items.Select(c => new CurrencyTypeDto(
                c.Id, c.Name, c.Prefix, c.CreatedAt, c.CreatedByUserId,
                c.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                c.UpdatedAt, c.UpdatedByUserId,
                c.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.CurrencyTypes, (IEnumerable<CurrencyTypeDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all currency types");
            throw;
        }
    }
}
