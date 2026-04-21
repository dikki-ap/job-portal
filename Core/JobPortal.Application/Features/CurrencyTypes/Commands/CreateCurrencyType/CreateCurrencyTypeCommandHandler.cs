using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.CreateCurrencyType;

public class CreateCurrencyTypeCommandHandler(
    ICurrencyTypeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateCurrencyTypeCommandHandler> logger)
    : IRequestHandler<CreateCurrencyTypeCommand, CurrencyTypeDto>
{
    public async Task<CurrencyTypeDto> Handle(CreateCurrencyTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var currencyType = new CurrencyType
            {
                Name = request.Name,
                Prefix = request.Prefix,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(currencyType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new CurrencyTypeDto(
                currencyType.Id, currencyType.Name, currencyType.Prefix,
                currencyType.CreatedAt, currencyType.CreatedByUserId, null,
                null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating currency type name={Name}", request.Name);
            throw;
        }
    }
}
