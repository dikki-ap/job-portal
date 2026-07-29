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
            var items = await repository.GetAllByDepartmentAsync(request.DepartmentIds, cancellationToken: cancellationToken);
            return items.Select(a => GetAllApplicationsQueryHandler.MapToDto(a));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting department applications for {Count} departments", request.DepartmentIds.Count);
            throw;
        }
    }
}
