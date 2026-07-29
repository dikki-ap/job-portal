using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkAcceptApplication;

public class BulkAcceptApplicationCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUserService,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkAcceptApplicationCommandHandler> logger)
    : IRequestHandler<BulkAcceptApplicationCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkAcceptApplicationCommand request, CancellationToken cancellationToken)
    {
        var ids = request.ApplicationIds.Distinct().ToList();
        var now = DateTime.UtcNow;
        var completedByUserId = currentUserService.GetCurrentUserId();
        var completedByName = currentUserService.GetCurrentUserFullName();

        var applications = await repository.GetByIdsAsync(ids, cancellationToken);

        var stepIdsToPass  = new List<int>();
        var appIdsToAccept = new List<int>();
        var emailQueue = new List<(ApplicationEntity App, ApplicationStep Step, bool Passed)>();
        var skipped = 0;

        foreach (var app in applications)
        {
            if (app.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
            {
                skipped++;
                continue;
            }

            appIdsToAccept.Add(app.Id);

            // Pass the current active step if one exists
            var currentStep = ApplicationStepHelper.FindCurrentActiveStep(app);
            if (currentStep is not null)
            {
                stepIdsToPass.Add(currentStep.Id);
                emailQueue.Add((app, currentStep, true));
            }
        }

        skipped += ids.Count - applications.Count;
        var succeeded = appIdsToAccept.Count;

        if (succeeded > 0)
        {
            await repository.ExecuteInTransactionAsync(async () =>
            {
                if (stepIdsToPass.Count > 0)
                    await repository.BulkPassStepsAsync(stepIdsToPass, now, completedByUserId, completedByName, cancellationToken);
                await repository.BulkAcceptAsync(appIdsToAccept, now, cancellationToken);
            }, cancellationToken);
        }

        logger.LogInformation("BulkAccept succeeded={S} skipped={Sk}", succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";
        await StepEmailHelper.SendBulkEmailsAsync(emailService, logger, emailQueue, primaryColor, companyName, cancellationToken);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
