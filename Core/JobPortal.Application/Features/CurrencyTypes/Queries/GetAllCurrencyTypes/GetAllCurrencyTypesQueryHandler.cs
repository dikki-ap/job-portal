using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Queries.GetAllCurrencyTypes;

public class GetAllCurrencyTypesQueryHandler(ICurrencyTypeRepository repository, ILogger<GetAllCurrencyTypesQueryHandler> logger)
    : IRequestHandler<GetAllCurrencyTypesQuery, IEnumerable<CurrencyTypeDto>>
{
    public async Task<IEnumerable<CurrencyTypeDto>> Handle(GetAllCurrencyTypesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(c => new CurrencyTypeDto(
                c.Id, c.Name, c.Prefix, c.CreatedAt, c.CreatedByUserId,
                c.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                c.UpdatedAt, c.UpdatedByUserId,
                c.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all currency types");
            throw;
        }
    }
}
