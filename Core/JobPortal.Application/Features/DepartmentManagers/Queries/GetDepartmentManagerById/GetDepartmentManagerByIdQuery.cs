using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.GetDepartmentManagerById;

public record GetDepartmentManagerByIdQuery(int Id) : IRequest<DepartmentManagerDto>;
