using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.DeleteCurrencyType;

public class DeleteCurrencyTypeCommandHandler(
    ICurrencyTypeRepository repository,
    IMemoryCache cache,
    ILogger<DeleteCurrencyTypeCommandHandler> logger)
    : IRequestHandler<DeleteCurrencyTypeCommand, Unit>
{
    public async Task<Unit> Handle(DeleteCurrencyTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var currencyType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Currency type with ID {request.Id} not found.");
            await repository.DeleteAsync(currencyType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.CurrencyTypes);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting currency type id={Id}", request.Id);
            throw;
        }
    }
}
