using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.ScheduleApplicationStep;

public class ScheduleApplicationStepCommandHandler(
    IApplicationRepository repository,
    ILogger<ScheduleApplicationStepCommandHandler> logger)
    : IRequestHandler<ScheduleApplicationStepCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(ScheduleApplicationStepCommand request, CancellationToken cancellationToken)
    {
        var application = await repository.GetByIdAsync(request.ApplicationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

        if (application.Status is Common.ApplicationStatus.Accepted or Common.ApplicationStatus.Rejected)
            throw new InvalidOperationException("Cannot schedule a step on a finalized application.");

        var step = application.Steps.FirstOrDefault(s => s.Id == request.StepId)
            ?? throw new KeyNotFoundException($"Step {request.StepId} not found on application {request.ApplicationId}.");

        step.ScheduledAt = request.ScheduledAt;
        step.ScheduledLocation = string.IsNullOrWhiteSpace(request.ScheduledLocation) ? null : request.ScheduledLocation.Trim();
        step.ScheduledNote = string.IsNullOrWhiteSpace(request.ScheduledNote) ? null : request.ScheduledNote.Trim();
        application.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(application, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Schedule set for step id={StepId} applicationId={AppId} scheduledAt={ScheduledAt}",
            step.Id, application.Id, step.ScheduledAt);

        return GetAllApplicationsQueryHandler.MapToDto(application);
    }
}
