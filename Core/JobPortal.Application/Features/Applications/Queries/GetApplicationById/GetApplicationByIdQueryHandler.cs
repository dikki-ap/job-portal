using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Queries.GetApplicationById;

public class GetApplicationByIdQueryHandler(
    IApplicationRepository repository,
    ILogger<GetApplicationByIdQueryHandler> logger)
    : IRequestHandler<GetApplicationByIdQuery, ApplicationDto?>
{
    public async Task<ApplicationDto?> Handle(GetApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByIdAsync(request.Id, cancellationToken);
            return application is null ? null : GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting application id={Id}", request.Id);
            throw;
        }
    }
}
