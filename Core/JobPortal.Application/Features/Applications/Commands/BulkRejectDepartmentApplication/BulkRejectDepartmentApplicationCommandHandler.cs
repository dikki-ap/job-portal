using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkRejectDepartmentApplication;

public class BulkRejectDepartmentApplicationCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkRejectDepartmentApplicationCommandHandler> logger)
    : IRequestHandler<BulkRejectDepartmentApplicationCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkRejectDepartmentApplicationCommand request, CancellationToken cancellationToken)
    {
        var ids = request.ApplicationIds.Distinct().ToList();
        var now = DateTime.UtcNow;
        var completedByUserId = currentUserService.GetCurrentUserId();
        var completedByName = currentUserService.GetCurrentUserFullName();

        var allApplications = await repository.GetByIdsAsync(ids, cancellationToken);
        var applications = allApplications
            .Where(a => request.DepartmentIds.Contains(a.JobPost.DepartmentId))
            .ToList();

        var stepIdsToFail      = new List<int>();
        var appIdsToReject     = new List<int>();
        var stepEmailQueue     = new List<(ApplicationEntity App, ApplicationStep Step, bool Passed)>();
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

        logger.LogInformation("DM BulkReject succeeded={S} skipped={Sk}", succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";

        await StepEmailHelper.SendBulkEmailsAsync(emailService, logger, stepEmailQueue, primaryColor, companyName, cancellationToken);

        foreach (var app in genericRejectQueue)
            await ApplicationEmailHelper.SendRejectedAsync(emailService, logger, app, primaryColor, companyName, cancellationToken);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
