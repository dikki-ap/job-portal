using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.GetAllDepartmentManagers;

public class GetAllDepartmentManagersQueryHandler(
    IDepartmentManagerRepository repository,
    ILogger<GetAllDepartmentManagersQueryHandler> logger)
    : IRequestHandler<GetAllDepartmentManagersQuery, IEnumerable<DepartmentManagerDto>>
{
    public async Task<IEnumerable<DepartmentManagerDto>> Handle(GetAllDepartmentManagersQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var managers = await repository.GetAllAsync(cancellationToken);
            return managers.Select(m => new DepartmentManagerDto(
                m.Id,
                m.FullName,
                m.Position,
                m.Email,
                m.DepartmentId,
                m.Department?.Name ?? string.Empty,
                m.CreatedAt,
                m.CreatedByUserId,
                m.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                m.UpdatedAt,
                m.UpdatedByUserId,
                m.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching all department managers");
            throw;
        }
    }
}
