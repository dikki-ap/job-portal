using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Queries.GetDocumentTypeById;

public class GetDocumentTypeByIdQueryHandler(IDocumentTypeRepository repository, ILogger<GetDocumentTypeByIdQueryHandler> logger)
    : IRequestHandler<GetDocumentTypeByIdQuery, DocumentTypeDto?>
{
    public async Task<DocumentTypeDto?> Handle(GetDocumentTypeByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var d = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (d is null) return null;
            return new DocumentTypeDto(
                d.Id, d.Name, d.MaxFileSizeMb,
                d.MimeTypes.Select(m => m.MimeType),
                d.CreatedAt, d.CreatedByUserId,
                d.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                d.UpdatedAt, d.UpdatedByUserId,
                d.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting document type id={Id}", request.Id);
            throw;
        }
    }
}
