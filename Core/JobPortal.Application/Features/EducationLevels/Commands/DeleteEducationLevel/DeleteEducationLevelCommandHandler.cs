using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Commands.DeleteEducationLevel;

public class DeleteEducationLevelCommandHandler(IEducationLevelRepository repository, ILogger<DeleteEducationLevelCommandHandler> logger)
    : IRequestHandler<DeleteEducationLevelCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEducationLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationLevel = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Education level with ID {request.Id} not found.");
            await repository.DeleteAsync(educationLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting education level id={Id}", request.Id);
            throw;
        }
    }
}
