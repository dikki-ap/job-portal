using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.CreateDepartment;

public class CreateDepartmentCommandHandler(IDepartmentRepository repository)
    : IRequestHandler<CreateDepartmentCommand, DepartmentDto>
{
    public async Task<DepartmentDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var department = new Department { Name = request.Name, CreatedAt = now, UpdatedAt = now };
        await repository.AddAsync(department, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return new DepartmentDto(department.Id, department.Name, department.CreatedAt, department.UpdatedAt);
    }
}
