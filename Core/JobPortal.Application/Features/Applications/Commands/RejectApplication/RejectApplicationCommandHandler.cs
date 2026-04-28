using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.RejectApplication;

public class RejectApplicationCommandHandler(
    IApplicationRepository repository,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<RejectApplicationCommandHandler> logger)
    : IRequestHandler<RejectApplicationCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(RejectApplicationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Application {request.Id} not found.");

            if (application.Status == ApplicationStatus.Accepted)
                throw new InvalidOperationException("An accepted application cannot be rejected.");

            var now = DateTime.UtcNow;
            application.Status = ApplicationStatus.Rejected;
            application.UpdatedAt = now;

            var currentStep = ApplicationStepHelper.FindCurrentActiveStep(application);
            if (currentStep is not null)
            {
                currentStep.Status = ApplicationStepStatus.Failed;
                currentStep.CompletedAt = now;
            }

            await repository.UpdateAsync(application, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Application rejected id={Id}", request.Id);

            var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", cancellationToken) ?? "#004181";
            var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", cancellationToken)  ?? "JobPortal";
            _ = ApplicationEmailHelper.SendRejectedAsync(emailService, logger, application, primaryColor, companyName, CancellationToken.None);

            return GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException and not InvalidOperationException)
        {
            logger.LogError(ex, "Error rejecting application id={Id}", request.Id);
            throw;
        }
    }
}
