using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.UpdateDepartmentManager;

public record UpdateDepartmentManagerCommand(
    int Id,
    string FullName,
    string Position,
    string Email,
    int DepartmentId) : IRequest<DepartmentManagerDto>;
