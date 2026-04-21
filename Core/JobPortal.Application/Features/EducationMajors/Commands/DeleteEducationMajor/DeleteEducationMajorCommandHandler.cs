using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Commands.DeleteEducationMajor;

public class DeleteEducationMajorCommandHandler(IEducationMajorRepository repository, ILogger<DeleteEducationMajorCommandHandler> logger)
    : IRequestHandler<DeleteEducationMajorCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEducationMajorCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationMajor = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Education major with ID {request.Id} not found.");
            await repository.DeleteAsync(educationMajor, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting education major id={Id}", request.Id);
            throw;
        }
    }
}
