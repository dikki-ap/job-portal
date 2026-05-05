using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplications;

public record GetDepartmentApplicationsQuery(int DepartmentId, string? Status = null)
    : IRequest<IEnumerable<ApplicationDto>>;
