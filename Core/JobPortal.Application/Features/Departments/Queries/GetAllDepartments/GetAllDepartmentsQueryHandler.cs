using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Departments.Queries.GetAllDepartments;

public class GetAllDepartmentsQueryHandler(IDepartmentRepository repository, ILogger<GetAllDepartmentsQueryHandler> logger)
    : IRequestHandler<GetAllDepartmentsQuery, IEnumerable<DepartmentDto>>
{
    public async Task<IEnumerable<DepartmentDto>> Handle(GetAllDepartmentsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var departments = await repository.GetAllAsync(cancellationToken);
            return departments.Select(d => new DepartmentDto(
                d.Id,
                d.Name,
                d.CreatedAt,
                d.CreatedByUserId,
                d.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                d.UpdatedAt,
                d.UpdatedByUserId,
                d.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while fetching all departments");
            throw;
        }
    }
}
