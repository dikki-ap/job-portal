using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetPagedApplications;

public class GetPagedApplicationsQueryHandler(IApplicationRepository repository)
    : IRequestHandler<GetPagedApplicationsQuery, PagedResult<ApplicationDto>>
{
    public async Task<PagedResult<ApplicationDto>> Handle(
        GetPagedApplicationsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await repository.GetPagedAsync(
            request.JobPostId, request.Status, request.Search,
            request.Page, request.PageSize, cancellationToken);

        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
        var dtos = items.Select(a => GetAllApplicationsQueryHandler.MapToDto(a)).ToList();
        return new PagedResult<ApplicationDto>(dtos, totalCount, request.Page, request.PageSize, totalPages);
    }
}
