using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DocumentTypes.Commands.UpdateDocumentType;

public record UpdateDocumentTypeCommand(int Id, string Name, int MaxFileSizeMb, bool IsDefaultRequired, List<string> MimeTypes) : IRequest<DocumentTypeDto>;
