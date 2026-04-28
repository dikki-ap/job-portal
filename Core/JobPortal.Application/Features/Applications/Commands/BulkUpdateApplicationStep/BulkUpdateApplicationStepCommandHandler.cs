using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkUpdateApplicationStep;

public class BulkUpdateApplicationStepCommandHandler(
    IApplicationRepository repository,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkUpdateApplicationStepCommandHandler> logger)
    : IRequestHandler<BulkUpdateApplicationStepCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkUpdateApplicationStepCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var ids = request.ApplicationIds.Distinct().ToList();

        // ONE query for all applications with their steps
        var applications = await repository.GetByIdsAsync(ids, cancellationToken);

        var stepIdsToPass   = new List<int>();
        var stepIdsToFail   = new List<int>();
        var appIdsToAccept  = new List<int>();
        var appIdsToReject  = new List<int>();
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
                {
                    appIdsToAccept.Add(app.Id);
                }
                else if (app.Status == ApplicationStatus.Pending)
                {
                    appIdsToInReview.Add(app.Id);
                }
            }
            else // Failed
            {
                stepIdsToFail.Add(currentStep.Id);
                appIdsToReject.Add(app.Id);
                emailQueue.Add((app, currentStep, false));
            }
        }

        var notFoundCount = ids.Count - applications.Count;
        skipped += notFoundCount;

        // stepIdsToPass includes last-step apps too, so don't add appIdsToAccept separately
        var succeeded = stepIdsToPass.Count + stepIdsToFail.Count;

        await repository.ExecuteInTransactionAsync(async () =>
        {
            if (stepIdsToPass.Count > 0)
                await repository.BulkPassStepsAsync(stepIdsToPass, now, cancellationToken);
            if (stepIdsToFail.Count > 0)
                await repository.BulkFailStepsAsync(stepIdsToFail, now, cancellationToken);
            if (appIdsToAccept.Count > 0)
                await repository.BulkAcceptAsync(appIdsToAccept, now, cancellationToken);
            if (appIdsToReject.Count > 0)
                await repository.BulkRejectAsync(appIdsToReject, now, cancellationToken);
            if (appIdsToInReview.Count > 0)
                await repository.BulkSetInReviewAsync(appIdsToInReview, now, cancellationToken);
        }, cancellationToken);

        logger.LogInformation("BulkUpdateStep action={Action} succeeded={S} skipped={Sk}",
            request.Action, succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";

        StepEmailHelper.FireAndForgetBulkEmails(emailService, logger, emailQueue, primaryColor, companyName);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
