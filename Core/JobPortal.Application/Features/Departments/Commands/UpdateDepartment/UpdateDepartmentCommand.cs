using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.UpdateDepartment;

public record UpdateDepartmentCommand(int Id, string Name) : IRequest<DepartmentDto>;
