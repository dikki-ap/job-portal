using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkUpdateDepartmentApplicationStep;

public class BulkUpdateDepartmentApplicationStepCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkUpdateDepartmentApplicationStepCommandHandler> logger)
    : IRequestHandler<BulkUpdateDepartmentApplicationStepCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkUpdateDepartmentApplicationStepCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var completedByUserId = currentUserService.GetCurrentUserId();
        var completedByName = currentUserService.GetCurrentUserFullName();
        var ids = request.ApplicationIds.Distinct().ToList();

        var allApplications = await repository.GetByIdsAsync(ids, cancellationToken);
        var applications = allApplications
            .Where(a => request.DepartmentIds.Contains(a.JobPost.DepartmentId))
            .ToList();

        var stepIdsToPass    = new List<int>();
        var stepIdsToFail    = new List<int>();
        var appIdsToAccept   = new List<int>();
        var appIdsToReject   = new List<int>();
        var appIdsToInReview = new List<int>();
        var emailQueue = new List<(ApplicationEntity App, ApplicationStep Step, bool Passed)>();
        var skipped = 0;

        foreach (var app in applications)
        {
            if (app.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
            {
                skipped++;
                continue;
            }

            var currentStep = ApplicationStepHelper.FindCurrentActiveStep(app);
            if (currentStep is null)
            {
                skipped++;
                continue;
            }

            if (request.Action == ApplicationStepStatus.Passed)
            {
                stepIdsToPass.Add(currentStep.Id);
                emailQueue.Add((app, currentStep, true));
                if (ApplicationStepHelper.IsLastRequiredStep(app, currentStep))
                    appIdsToAccept.Add(app.Id);
                else if (app.Status == ApplicationStatus.Pending)
                    appIdsToInReview.Add(app.Id);
            }
            else
            {
                stepIdsToFail.Add(currentStep.Id);
                appIdsToReject.Add(app.Id);
                emailQueue.Add((app, currentStep, false));
            }
        }

        skipped += ids.Count - applications.Count;
        var succeeded = stepIdsToPass.Count + stepIdsToFail.Count;

        await repository.ExecuteInTransactionAsync(async () =>
        {
            if (stepIdsToPass.Count > 0)
                await repository.BulkPassStepsAsync(stepIdsToPass, now, completedByUserId, completedByName, cancellationToken);
            if (stepIdsToFail.Count > 0)
                await repository.BulkFailStepsAsync(stepIdsToFail, now, completedByUserId, completedByName, cancellationToken);
            if (appIdsToAccept.Count > 0)
                await repository.BulkAcceptAsync(appIdsToAccept, now, cancellationToken);
            if (appIdsToReject.Count > 0)
                await repository.BulkRejectAsync(appIdsToReject, now, cancellationToken);
            if (appIdsToInReview.Count > 0)
                await repository.BulkSetInReviewAsync(appIdsToInReview, now, cancellationToken);
        }, cancellationToken);

        logger.LogInformation("DM BulkUpdateStep action={Action} succeeded={S} skipped={Sk}",
            request.Action, succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";

        await StepEmailHelper.SendBulkEmailsAsync(emailService, logger, emailQueue, primaryColor, companyName, cancellationToken);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
