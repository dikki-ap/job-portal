using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetPagedDepartmentApplications;

public record GetPagedDepartmentApplicationsQuery(
    IReadOnlyList<int> DepartmentIds,
    int? JobPostId,
    string? Status,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ApplicationDto>>;
