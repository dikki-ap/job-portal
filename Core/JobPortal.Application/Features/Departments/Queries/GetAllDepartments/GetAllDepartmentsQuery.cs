using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Departments.Queries.GetAllDepartments;

public record GetAllDepartmentsQuery : IRequest<IEnumerable<DepartmentDto>>;
