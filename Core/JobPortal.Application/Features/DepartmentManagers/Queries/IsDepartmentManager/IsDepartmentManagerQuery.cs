using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.IsDepartmentManager;

public record IsDepartmentManagerQuery : IRequest<IsDepartmentManagerDto>;
