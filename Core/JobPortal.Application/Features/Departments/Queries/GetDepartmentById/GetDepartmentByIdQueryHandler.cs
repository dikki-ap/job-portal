using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Departments.Queries.GetDepartmentById;

public class GetDepartmentByIdQueryHandler(IDepartmentRepository repository)
    : IRequestHandler<GetDepartmentByIdQuery, DepartmentDto?>
{
    public async Task<DepartmentDto?> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var department = await repository.GetByIdAsync(request.Id, cancellationToken);
        return department is null ? null : new DepartmentDto(department.Id, department.Name, department.CreatedAt, department.UpdatedAt);
    }
}
