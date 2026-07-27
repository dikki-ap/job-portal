using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.ScheduleApplicationStep;

public record ScheduleApplicationStepCommand(
    int ApplicationId,
    int StepId,
    DateTime? ScheduledAt,
    string? ScheduledLocation,
    string? ScheduledNote)
    : IRequest<ApplicationDto>;
