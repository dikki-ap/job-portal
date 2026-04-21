using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.DeleteDepartment;

public record DeleteDepartmentCommand(int Id) : IRequest<Unit>;
