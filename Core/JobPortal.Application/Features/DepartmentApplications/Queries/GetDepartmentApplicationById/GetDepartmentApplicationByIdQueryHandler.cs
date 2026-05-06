using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplicationById;

public class GetDepartmentApplicationByIdQueryHandler(
    IApplicationRepository repository,
    ILogger<GetDepartmentApplicationByIdQueryHandler> logger)
    : IRequestHandler<GetDepartmentApplicationByIdQuery, ApplicationDto?>
{
    public async Task<ApplicationDto?> Handle(GetDepartmentApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByIdAsync(request.ApplicationId, cancellationToken);
            if (application is null)
                return null;

            if (!request.DepartmentIds.Contains(application.JobPost?.DepartmentId ?? 0))
                throw new UnauthorizedAccessException("You do not have access to this application.");

            return GetAllApplicationsQueryHandler.MapToDto(application);
        }
        catch (Exception ex) when (ex is not UnauthorizedAccessException)
        {
            logger.LogError(ex, "Error getting department application id={Id}", request.ApplicationId);
            throw;
        }
    }
}
