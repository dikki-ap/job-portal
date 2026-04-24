using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;

public record CreateHiringTemplateStepRequest(
    string Name,
    bool IsRequired,
    string? PassEmailSubject,
    string? PassEmailBody,
    string? FailEmailSubject,
    string? FailEmailBody);

public record CreateHiringTemplateCommand(
    string Name,
    string? Description,
    List<CreateHiringTemplateStepRequest> Steps) : IRequest<HiringTemplateDto>;
