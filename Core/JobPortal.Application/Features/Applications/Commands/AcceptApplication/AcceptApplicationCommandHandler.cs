using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.AcceptApplication;

public class AcceptApplicationCommandHandler(
    IApplicationRepository repository,
    ILogger<AcceptApplicationCommandHandler> logger)
    : IRequestHandler<AcceptApplicationCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(AcceptApplicationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Application {request.Id} not found.");

            if (application.Status != ApplicationStatus.InReview)
                throw new InvalidOperationException("Only applications in 'InReview' status can be accepted.");

            application.Status = ApplicationStatus.Accepted;
            application.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(application, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Application accepted id={Id}", request.Id);
            return GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException and not InvalidOperationException)
        {
            logger.LogError(ex, "Error accepting application id={Id}", request.Id);
            throw;
        }
    }
}
