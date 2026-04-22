using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Queries.GetAllDocumentTypes;

public class GetAllDocumentTypesQueryHandler(IDocumentTypeRepository repository, ILogger<GetAllDocumentTypesQueryHandler> logger)
    : IRequestHandler<GetAllDocumentTypesQuery, IEnumerable<DocumentTypeDto>>
{
    public async Task<IEnumerable<DocumentTypeDto>> Handle(GetAllDocumentTypesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(d => new DocumentTypeDto(
                d.Id, d.Name, d.MaxFileSizeMb,
                d.IsDefaultRequired,
                d.MimeTypes.Select(m => m.MimeType),
                d.CreatedAt, d.CreatedByUserId,
                d.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                d.UpdatedAt, d.UpdatedByUserId,
                d.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all document types");
            throw;
        }
    }
}
