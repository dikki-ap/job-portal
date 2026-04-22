using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.UpdateApplicationStep;

public record UpdateApplicationStepCommand(int ApplicationId, int StepId, string StepStatus)
    : IRequest<ApplicationDto>;
