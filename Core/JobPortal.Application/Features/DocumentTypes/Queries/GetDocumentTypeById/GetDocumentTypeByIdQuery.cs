using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DocumentTypes.Queries.GetDocumentTypeById;

public record GetDocumentTypeByIdQuery(int Id) : IRequest<DocumentTypeDto?>;
