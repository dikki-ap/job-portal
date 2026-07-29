using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetPagedApplications;

public record GetPagedApplicationsQuery(
    int? JobPostId,
    string? Status,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ApplicationDto>>;
