using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobLevels.Commands.DeleteJobLevel;

public class DeleteJobLevelCommandHandler(IJobLevelRepository repository, ILogger<DeleteJobLevelCommandHandler> logger)
    : IRequestHandler<DeleteJobLevelCommand, Unit>
{
    public async Task<Unit> Handle(DeleteJobLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobLevel = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job level with ID {request.Id} not found.");
            await repository.DeleteAsync(jobLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting job level id={Id}", request.Id);
            throw;
        }
    }
}
