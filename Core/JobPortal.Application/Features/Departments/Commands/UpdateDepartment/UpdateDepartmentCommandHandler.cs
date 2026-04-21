using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.UpdateDepartment;

public class UpdateDepartmentCommandHandler(IDepartmentRepository repository)
    : IRequestHandler<UpdateDepartmentCommand, DepartmentDto>
{
    public async Task<DepartmentDto> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Department with ID {request.Id} not found.");

        department.Name = request.Name;
        department.UpdatedAt = DateTime.UtcNow;
        await repository.UpdateAsync(department, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return new DepartmentDto(department.Id, department.Name, department.CreatedAt, department.UpdatedAt);
    }
}
