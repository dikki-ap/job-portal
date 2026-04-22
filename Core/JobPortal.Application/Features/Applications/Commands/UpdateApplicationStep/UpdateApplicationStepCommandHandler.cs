using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.UpdateApplicationStep;

public class UpdateApplicationStepCommandHandler(
    IApplicationRepository repository,
    ILogger<UpdateApplicationStepCommandHandler> logger)
    : IRequestHandler<UpdateApplicationStepCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(UpdateApplicationStepCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByIdAsync(request.ApplicationId, cancellationToken)
                ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

            if (application.Status is ApplicationStatus.Accepted or ApplicationStatus.Rejected)
                throw new InvalidOperationException("Cannot update steps on a finalized application.");

            var step = application.Steps.FirstOrDefault(s => s.Id == request.StepId)
                ?? throw new KeyNotFoundException($"Step {request.StepId} not found on application {request.ApplicationId}.");

            if (step.Status != ApplicationStepStatus.Pending)
                throw new InvalidOperationException("Only pending steps can be updated.");

            // Sequential validation: all required steps with lower order must be Passed first
            var hasBlockingPreviousStep = application.Steps
                .Any(s => s.StepOrder < step.StepOrder
                          && (s.JobStep?.IsRequired ?? true)
                          && s.Status != ApplicationStepStatus.Passed);

            if (hasBlockingPreviousStep)
                throw new InvalidOperationException("Previous steps must be completed before this step can be updated.");

            var now = DateTime.UtcNow;
            step.Status = request.StepStatus;
            step.CompletedAt = now;
            application.UpdatedAt = now;

            if (request.StepStatus == ApplicationStepStatus.Failed)
            {
                application.Status = ApplicationStatus.Rejected;
            }
            else if (request.StepStatus == ApplicationStepStatus.Passed)
            {
                var isLastRequiredStep = !application.Steps
                    .Any(s => s.StepOrder > step.StepOrder && (s.JobStep?.IsRequired ?? true));

                if (isLastRequiredStep)
                    application.Status = ApplicationStatus.Accepted;
            }

            await repository.UpdateAsync(application, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("ApplicationStep updated id={StepId} status={Status}", step.Id, step.Status);
            return GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException and not InvalidOperationException)
        {
            logger.LogError(ex, "Error updating application step applicationId={Id}", request.ApplicationId);
            throw;
        }
    }
}
