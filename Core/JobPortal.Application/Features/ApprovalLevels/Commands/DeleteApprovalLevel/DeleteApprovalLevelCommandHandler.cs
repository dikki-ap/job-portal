using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.DeleteApprovalLevel;

public class DeleteApprovalLevelCommandHandler(
    IApprovalLevelRepository repository,
    ILogger<DeleteApprovalLevelCommandHandler> logger)
    : IRequestHandler<DeleteApprovalLevelCommand, Unit>
{
    public async Task<Unit> Handle(DeleteApprovalLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var level = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Approval level with ID {request.Id} not found.");

            await repository.DeleteAsync(level, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("ApprovalLevel deleted id={Id}", request.Id);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting approval level id={Id}", request.Id);
            throw;
        }
    }
}
