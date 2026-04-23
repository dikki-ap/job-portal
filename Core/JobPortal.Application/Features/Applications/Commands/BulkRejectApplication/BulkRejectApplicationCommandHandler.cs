using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.BulkRejectApplication;

public class BulkRejectApplicationCommandHandler(
    IApplicationRepository repository,
    ILogger<BulkRejectApplicationCommandHandler> logger)
    : IRequestHandler<BulkRejectApplicationCommand, BulkOperationResultDto>
{
    public async Task<BulkOperationResultDto> Handle(BulkRejectApplicationCommand request, CancellationToken cancellationToken)
    {
        var ids = request.ApplicationIds.Distinct().ToList();
        var now = DateTime.UtcNow;

        var applications = await repository.GetByIdsAsync(ids, cancellationToken);

        var stepIdsToFail  = new List<int>();
        var appIdsToReject = new List<int>();
        var skipped = 0;

        foreach (var app in applications)
        {
            if (app.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
            {
                skipped++;
                continue;
            }

            appIdsToReject.Add(app.Id);

            // Fail the current active step if one exists
            var currentStep = ApplicationStepHelper.FindCurrentActiveStep(app);
            if (currentStep is not null)
                stepIdsToFail.Add(currentStep.Id);
        }

        skipped += ids.Count - applications.Count;
        var succeeded = appIdsToReject.Count;

        if (succeeded > 0)
        {
            await repository.ExecuteInTransactionAsync(async () =>
            {
                if (stepIdsToFail.Count > 0)
                    await repository.BulkFailStepsAsync(stepIdsToFail, now, cancellationToken);
                await repository.BulkRejectAsync(appIdsToReject, now, cancellationToken);
            }, cancellationToken);
        }

        logger.LogInformation("BulkReject succeeded={S} skipped={Sk}", succeeded, skipped);

        return new BulkOperationResultDto(succeeded, skipped, []);
    }
}
