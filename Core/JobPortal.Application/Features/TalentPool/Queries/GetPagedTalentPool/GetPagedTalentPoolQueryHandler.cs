using JobPortal.Application.DTOs;
using JobPortal.Application.Features.TalentPool.Queries.GetTalentPool;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Queries.GetPagedTalentPool;

public class GetPagedTalentPoolQueryHandler(ITalentPoolRepository repository)
    : IRequestHandler<GetPagedTalentPoolQuery, PagedResult<TalentPoolEntryDto>>
{
    public async Task<PagedResult<TalentPoolEntryDto>> Handle(GetPagedTalentPoolQuery request, CancellationToken ct)
    {
        var (items, totalCount) = await repository.GetPagedAsync(request.Page, request.PageSize, request.Search, ct);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
        var dtos = items.Select(GetTalentPoolQueryHandler.MapToDto).ToList();
        return new PagedResult<TalentPoolEntryDto>(dtos, totalCount, request.Page, request.PageSize, totalPages);
    }
}
