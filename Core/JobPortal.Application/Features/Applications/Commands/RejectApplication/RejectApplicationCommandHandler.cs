using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.RejectApplication;

public class RejectApplicationCommandHandler(
    IApplicationRepository repository,
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

            application.Status = ApplicationStatus.Rejected;
            application.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(application, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Application rejected id={Id}", request.Id);
            return GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException and not InvalidOperationException)
        {
            logger.LogError(ex, "Error rejecting application id={Id}", request.Id);
            throw;
        }
    }
}
