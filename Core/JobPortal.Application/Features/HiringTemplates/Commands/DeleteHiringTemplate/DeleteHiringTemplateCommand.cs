using MediatR;

namespace JobPortal.Application.Features.HiringTemplates.Commands.DeleteHiringTemplate;

public record DeleteHiringTemplateCommand(int Id) : IRequest<Unit>;
