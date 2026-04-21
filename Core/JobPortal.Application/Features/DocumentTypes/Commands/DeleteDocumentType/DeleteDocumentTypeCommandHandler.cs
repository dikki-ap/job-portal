using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Commands.DeleteDocumentType;

public class DeleteDocumentTypeCommandHandler(IDocumentTypeRepository repository, ILogger<DeleteDocumentTypeCommandHandler> logger)
    : IRequestHandler<DeleteDocumentTypeCommand, Unit>
{
    public async Task<Unit> Handle(DeleteDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var documentType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Document type with ID {request.Id} not found.");
            await repository.DeleteAsync(documentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting document type id={Id}", request.Id);
            throw;
        }
    }
}
