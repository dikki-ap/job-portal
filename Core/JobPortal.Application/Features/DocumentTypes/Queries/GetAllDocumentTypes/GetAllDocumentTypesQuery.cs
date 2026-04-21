using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DocumentTypes.Queries.GetAllDocumentTypes;

public record GetAllDocumentTypesQuery : IRequest<IEnumerable<DocumentTypeDto>>;
