using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.DeleteDepartmentManager;

public class DeleteDepartmentManagerCommandHandler(
    IDepartmentManagerRepository repository,
    IMemoryCache cache,
    ILogger<DeleteDepartmentManagerCommandHandler> logger)
    : IRequestHandler<DeleteDepartmentManagerCommand, Unit>
{
    public async Task<Unit> Handle(DeleteDepartmentManagerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var manager = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Department manager with ID {request.Id} not found.");

            var email = manager.Email;
            await repository.DeleteAsync(manager, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            cache.Remove(CacheKeys.DmIdentity(email));
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting department manager id={Id}", request.Id);
            throw;
        }
    }
}
