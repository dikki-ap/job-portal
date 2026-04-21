using MediatR;

namespace JobPortal.Application.Features.DocumentTypes.Commands.DeleteDocumentType;

public record DeleteDocumentTypeCommand(int Id) : IRequest<Unit>;
