using JobPortal.Application.DTOs;
using JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;
using MediatR;

namespace JobPortal.Application.Features.HiringTemplates.Commands.UpdateHiringTemplate;

public record UpdateHiringTemplateCommand(
    int Id,
    string Name,
    string? Description,
    List<CreateHiringTemplateStepRequest> Steps) : IRequest<HiringTemplateDto>;
