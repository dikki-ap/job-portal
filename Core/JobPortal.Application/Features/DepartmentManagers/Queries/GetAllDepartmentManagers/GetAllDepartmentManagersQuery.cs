using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.GetAllDepartmentManagers;

public record GetAllDepartmentManagersQuery : IRequest<IEnumerable<DepartmentManagerDto>>;
