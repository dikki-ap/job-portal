using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.DeleteDepartment;

public class DeleteDepartmentCommandHandler(IDepartmentRepository repository)
    : IRequestHandler<DeleteDepartmentCommand>
{
    public async Task Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Department with ID {request.Id} not found.");

        await repository.DeleteAsync(department, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
    }
}
