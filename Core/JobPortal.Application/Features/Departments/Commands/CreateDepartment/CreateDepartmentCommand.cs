using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Departments.Commands.CreateDepartment;

public record CreateDepartmentCommand(string Name) : IRequest<DepartmentDto>;
