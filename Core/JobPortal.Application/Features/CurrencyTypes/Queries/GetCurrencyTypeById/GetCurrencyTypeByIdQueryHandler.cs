using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Queries.GetCurrencyTypeById;

public class GetCurrencyTypeByIdQueryHandler(ICurrencyTypeRepository repository, ILogger<GetCurrencyTypeByIdQueryHandler> logger)
    : IRequestHandler<GetCurrencyTypeByIdQuery, CurrencyTypeDto?>
{
    public async Task<CurrencyTypeDto?> Handle(GetCurrencyTypeByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var c = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (c is null) return null;
            return new CurrencyTypeDto(
                c.Id, c.Name, c.Prefix, c.CreatedAt, c.CreatedByUserId,
                c.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                c.UpdatedAt, c.UpdatedByUserId,
                c.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting currency type id={Id}", request.Id);
            throw;
        }
    }
}
