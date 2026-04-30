using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Commands.UpdateDocumentType;

public class UpdateDocumentTypeCommandHandler(
    IDocumentTypeRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<UpdateDocumentTypeCommandHandler> logger)
    : IRequestHandler<UpdateDocumentTypeCommand, DocumentTypeDto>
{
    public async Task<DocumentTypeDto> Handle(UpdateDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var documentType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Document type with ID {request.Id} not found.");

            documentType.Name = request.Name;
            documentType.MaxFileSizeMb = request.MaxFileSizeMb;
            documentType.IsDefaultRequired = request.IsDefaultRequired;
            documentType.UpdatedAt = DateTime.UtcNow;
            documentType.UpdatedByUserId = currentUserService.GetCurrentUserId();
            documentType.MimeTypes.Clear();
            foreach (var mimeType in request.MimeTypes)
                documentType.MimeTypes.Add(new DocumentTypeMimeType { MimeType = mimeType });
            await repository.UpdateAsync(documentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.DocumentTypes);

            return new DocumentTypeDto(
                documentType.Id, documentType.Name, documentType.MaxFileSizeMb,
                documentType.IsDefaultRequired,
                documentType.MimeTypes.Select(m => m.MimeType),
                documentType.CreatedAt, documentType.CreatedByUserId,
                documentType.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                documentType.UpdatedAt, documentType.UpdatedByUserId,
                documentType.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating document type id={Id}", request.Id);
            throw;
        }
    }
}
