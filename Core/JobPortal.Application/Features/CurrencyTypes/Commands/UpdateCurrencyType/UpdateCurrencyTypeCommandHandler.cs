using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.UpdateCurrencyType;

public class UpdateCurrencyTypeCommandHandler(
    ICurrencyTypeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateCurrencyTypeCommandHandler> logger)
    : IRequestHandler<UpdateCurrencyTypeCommand, CurrencyTypeDto>
{
    public async Task<CurrencyTypeDto> Handle(UpdateCurrencyTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var currencyType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Currency type with ID {request.Id} not found.");

            currencyType.Name = request.Name;
            currencyType.Prefix = request.Prefix;
            currencyType.UpdatedAt = DateTime.UtcNow;
            currencyType.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(currencyType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new CurrencyTypeDto(
                currencyType.Id, currencyType.Name, currencyType.Prefix,
                currencyType.CreatedAt, currencyType.CreatedByUserId,
                currencyType.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                currencyType.UpdatedAt, currencyType.UpdatedByUserId,
                currencyType.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating currency type id={Id}", request.Id);
            throw;
        }
    }
}
