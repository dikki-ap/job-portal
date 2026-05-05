using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.DeleteDepartmentManager;

public record DeleteDepartmentManagerCommand(int Id) : IRequest<Unit>;
