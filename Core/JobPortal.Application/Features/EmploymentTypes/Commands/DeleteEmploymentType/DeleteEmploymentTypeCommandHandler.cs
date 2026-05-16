using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.DeleteEmploymentType;

public class DeleteEmploymentTypeCommandHandler(
    IEmploymentTypeRepository repository,
    IMemoryCache cache,
    ILogger<DeleteEmploymentTypeCommandHandler> logger)
    : IRequestHandler<DeleteEmploymentTypeCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEmploymentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var employmentType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employment type with ID {request.Id} not found.");
            await repository.DeleteAsync(employmentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.EmploymentTypes);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting employment type id={Id}", request.Id);
            throw;
        }
    }
}
