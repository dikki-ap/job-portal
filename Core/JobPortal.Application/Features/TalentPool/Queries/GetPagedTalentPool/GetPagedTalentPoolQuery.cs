using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Queries.GetPagedTalentPool;

public record GetPagedTalentPoolQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null) : IRequest<PagedResult<TalentPoolEntryDto>>;
