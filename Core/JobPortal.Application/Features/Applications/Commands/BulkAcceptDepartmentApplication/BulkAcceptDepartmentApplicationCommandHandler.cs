using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;
using ApplicationStep = JobPortal.Domain.Entities.Applications.ApplicationStep;

namespace JobPortal.Application.Features.Applications.Commands.BulkAcceptDepartmentApplication;

public class BulkAcceptDepartmentApplicationCommandHandler(
    IApplicationRepository repository,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<BulkAcceptDepartmentApplicationCommandHandler> logger)
    : IRequestHandler<BulkAcceptDepartmentApplicationCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkAcceptDepartmentApplicationCommand request, CancellationToken cancellationToken)
    {
        var ids = request.ApplicationIds.Distinct().ToList();
        var now = DateTime.UtcNow;

        var allApplications = await repository.GetByIdsAsync(ids, cancellationToken);
        var applications = allApplications
            .Where(a => request.DepartmentIds.Contains(a.JobPost.DepartmentId))
            .ToList();

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
                    await repository.BulkPassStepsAsync(stepIdsToPass, now, cancellationToken);
                await repository.BulkAcceptAsync(appIdsToAccept, now, cancellationToken);
            }, cancellationToken);
        }

        logger.LogInformation("DM BulkAccept succeeded={S} skipped={Sk}", succeeded, skipped);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";
        StepEmailHelper.FireAndForgetBulkEmails(emailService, logger, emailQueue, primaryColor, companyName);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
