using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.CreateDepartmentManager;

public record CreateDepartmentManagerCommand(
    string FullName,
    string Position,
    string Email,
    IReadOnlyList<int> DepartmentIds) : IRequest<DepartmentManagerDto>;
