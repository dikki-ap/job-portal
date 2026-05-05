using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplications;

public class GetDepartmentApplicationsQueryHandler(
    IApplicationRepository repository,
    ILogger<GetDepartmentApplicationsQueryHandler> logger)
    : IRequestHandler<GetDepartmentApplicationsQuery, IEnumerable<ApplicationDto>>
{
    public async Task<IEnumerable<ApplicationDto>> Handle(GetDepartmentApplicationsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllByDepartmentAsync(request.DepartmentId, request.Status, cancellationToken);
            return items.Select(GetAllApplicationsQueryHandler.MapToDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting department applications departmentId={DepartmentId}", request.DepartmentId);
            throw;
        }
    }
}
