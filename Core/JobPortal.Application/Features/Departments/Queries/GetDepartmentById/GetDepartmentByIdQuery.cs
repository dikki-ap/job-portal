using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Departments.Queries.GetDepartmentById;

public record GetDepartmentByIdQuery(int Id) : IRequest<DepartmentDto?>;
