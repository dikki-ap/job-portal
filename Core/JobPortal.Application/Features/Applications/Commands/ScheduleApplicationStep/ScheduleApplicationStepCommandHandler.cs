using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.ScheduleApplicationStep;

public class ScheduleApplicationStepCommandHandler(
    IApplicationRepository repository,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<ScheduleApplicationStepCommandHandler> logger)
    : IRequestHandler<ScheduleApplicationStepCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(ScheduleApplicationStepCommand request, CancellationToken cancellationToken)
    {
        var application = await repository.GetByIdAsync(request.ApplicationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

        if (application.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
            throw new InvalidOperationException("Cannot schedule a step on a finalized application.");

        var step = application.Steps.FirstOrDefault(s => s.Id == request.StepId)
            ?? throw new KeyNotFoundException($"Step {request.StepId} not found on application {request.ApplicationId}.");

        var wasScheduled = step.ScheduledAt.HasValue;
        var stepName = step.StepName;

        step.ScheduledAt = request.ScheduledAt;
        step.ScheduledLocation = string.IsNullOrWhiteSpace(request.ScheduledLocation) ? null : request.ScheduledLocation.Trim();
        step.ScheduledNote = string.IsNullOrWhiteSpace(request.ScheduledNote) ? null : request.ScheduledNote.Trim();
        application.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(application, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Schedule set for step id={StepId} applicationId={AppId} scheduledAt={ScheduledAt}",
            step.Id, application.Id, step.ScheduledAt);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName",  cancellationToken) ?? "JobPortal";

        if (!request.ScheduledAt.HasValue)
        {
            // Clear schedule
            await ScheduleEmailHelper.SendCancelledAsync(
                emailService, logger, application, stepName, primaryColor, companyName, CancellationToken.None);
        }
        else if (!wasScheduled)
        {
            // New schedule
            await ScheduleEmailHelper.SendScheduledAsync(
                emailService, logger, application, stepName, request.ScheduledAt.Value,
                step.ScheduledLocation, step.ScheduledNote, primaryColor, companyName, CancellationToken.None);
        }
        else
        {
            // Updated existing schedule
            await ScheduleEmailHelper.SendUpdatedAsync(
                emailService, logger, application, stepName, request.ScheduledAt.Value,
                step.ScheduledLocation, step.ScheduledNote, primaryColor, companyName, CancellationToken.None);
        }

        return GetAllApplicationsQueryHandler.MapToDto(application);
    }
}
