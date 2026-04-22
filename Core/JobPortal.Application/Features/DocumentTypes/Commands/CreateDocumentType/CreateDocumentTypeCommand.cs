using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DocumentTypes.Commands.CreateDocumentType;

public record CreateDocumentTypeCommand(string Name, int MaxFileSizeMb, bool IsDefaultRequired, List<string> MimeTypes) : IRequest<DocumentTypeDto>;
