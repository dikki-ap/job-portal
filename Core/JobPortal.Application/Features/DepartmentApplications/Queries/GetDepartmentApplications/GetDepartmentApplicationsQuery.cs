using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplications;

public record GetDepartmentApplicationsQuery(IReadOnlyList<int> DepartmentIds)
    : IRequest<IEnumerable<ApplicationDto>>;
