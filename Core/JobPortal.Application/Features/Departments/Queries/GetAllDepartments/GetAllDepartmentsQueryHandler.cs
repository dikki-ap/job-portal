using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Departments.Queries.GetAllDepartments;

public class GetAllDepartmentsQueryHandler(IDepartmentRepository repository)
    : IRequestHandler<GetAllDepartmentsQuery, IEnumerable<DepartmentDto>>
{
    public async Task<IEnumerable<DepartmentDto>> Handle(GetAllDepartmentsQuery request, CancellationToken cancellationToken)
    {
        var departments = await repository.GetAllAsync(cancellationToken);
        return departments.Select(d => new DepartmentDto(d.Id, d.Name, d.CreatedAt, d.UpdatedAt));
    }
}
