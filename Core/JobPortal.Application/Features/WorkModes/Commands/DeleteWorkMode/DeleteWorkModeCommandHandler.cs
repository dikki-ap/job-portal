using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Commands.DeleteWorkMode;

public class DeleteWorkModeCommandHandler(
    IWorkModeRepository repository,
    IMemoryCache cache,
    ILogger<DeleteWorkModeCommandHandler> logger)
    : IRequestHandler<DeleteWorkModeCommand, Unit>
{
    public async Task<Unit> Handle(DeleteWorkModeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workMode = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Work mode with ID {request.Id} not found.");
            await repository.DeleteAsync(workMode, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.WorkModes);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting work mode id={Id}", request.Id);
            throw;
        }
    }
}
