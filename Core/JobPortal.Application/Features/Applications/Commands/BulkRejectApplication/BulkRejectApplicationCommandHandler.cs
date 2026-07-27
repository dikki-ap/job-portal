using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkRejectApplication;

public class BulkRejectApplicationCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkRejectApplicationCommandHandler> logger)
    : IRequestHandler<BulkRejectApplicationCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkRejectApplicationCommand request, CancellationToken cancellationToken)
    {
        var ids = request.ApplicationIds.Distinct().ToList();
        var now = DateTime.UtcNow;
        var completedByUserId = currentUserService.GetCurrentUserId();
        var completedByName = currentUserService.GetCurrentUserFullName();

        var applications = await repository.GetByIdsAsync(ids, cancellationToken);

        var stepIdsToFail  = new List<int>();
        var appIdsToReject = new List<int>();
        var stepEmailQueue    = new List<(ApplicationEntity App, ApplicationStep Step, bool Passed)>();
        var genericRejectQueue = new List<ApplicationEntity>();
        var skipped = 0;

        foreach (var app in applications)
        {
            if (app.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
            {
                skipped++;
                continue;
            }

            appIdsToReject.Add(app.Id);

            var currentStep = ApplicationStepHelper.FindCurrentActiveStep(app);
            if (currentStep is not null)
            {
                stepIdsToFail.Add(currentStep.Id);

                // Use step fail template if configured, otherwise fall back to generic rejection email
                var hasTemplate = !string.IsNullOrWhiteSpace(currentStep.JobStep?.FailEmailSubject)
                               && !string.IsNullOrWhiteSpace(currentStep.JobStep?.FailEmailBody);
                if (hasTemplate)
                    stepEmailQueue.Add((app, currentStep, false));
                else
                    genericRejectQueue.Add(app);
            }
            else
            {
                genericRejectQueue.Add(app);
            }
        }

        skipped += ids.Count - applications.Count;
        var succeeded = appIdsToReject.Count;

        if (succeeded > 0)
        {
            await repository.ExecuteInTransactionAsync(async () =>
            {
                if (stepIdsToFail.Count > 0)
                    await repository.BulkFailStepsAsync(stepIdsToFail, now, completedByUserId, completedByName, cancellationToken);
                await repository.BulkRejectAsync(appIdsToReject, now, cancellationToken);
            }, cancellationToken);
        }

        logger.LogInformation("BulkReject succeeded={S} skipped={Sk}", succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";

        StepEmailHelper.FireAndForgetBulkEmails(emailService, logger, stepEmailQueue, primaryColor, companyName);

        if (genericRejectQueue.Count > 0)
        {
            _ = Task.Run(async () =>
            {
                foreach (var app in genericRejectQueue)
                    await ApplicationEmailHelper.SendRejectedAsync(emailService, logger, app, primaryColor, companyName);
            });
        }

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
