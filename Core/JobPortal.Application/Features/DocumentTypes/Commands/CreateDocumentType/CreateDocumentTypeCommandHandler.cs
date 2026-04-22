using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Commands.CreateDocumentType;

public class CreateDocumentTypeCommandHandler(
    IDocumentTypeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateDocumentTypeCommandHandler> logger)
    : IRequestHandler<CreateDocumentTypeCommand, DocumentTypeDto>
{
    public async Task<DocumentTypeDto> Handle(CreateDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var documentType = new DocumentType
            {
                Name = request.Name,
                MaxFileSizeMb = request.MaxFileSizeMb,
                IsDefaultRequired = request.IsDefaultRequired,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
                MimeTypes = request.MimeTypes.Select(m => new DocumentTypeMimeType { MimeType = m }).ToList(),
            };
            await repository.AddAsync(documentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new DocumentTypeDto(
                documentType.Id, documentType.Name, documentType.MaxFileSizeMb,
                documentType.IsDefaultRequired,
                documentType.MimeTypes.Select(m => m.MimeType),
                documentType.CreatedAt, documentType.CreatedByUserId, null,
                null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating document type name={Name}", request.Name);
            throw;
        }
    }
}
