using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.HiringTemplates.Commands.DeleteHiringTemplate;

public class DeleteHiringTemplateCommandHandler(
    IHiringTemplateRepository repository,
    ILogger<DeleteHiringTemplateCommandHandler> logger)
    : IRequestHandler<DeleteHiringTemplateCommand, Unit>
{
    public async Task<Unit> Handle(DeleteHiringTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"HiringTemplate {request.Id} not found.");

            await repository.DeleteAsync(template, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("HiringTemplate deleted id={Id}", request.Id);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting hiring template id={Id}", request.Id);
            throw;
        }
    }
}
