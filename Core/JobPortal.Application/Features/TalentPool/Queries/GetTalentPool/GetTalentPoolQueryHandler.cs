using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.TalentPool;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Queries.GetTalentPool;

public class GetTalentPoolQueryHandler(ITalentPoolRepository repository)
    : IRequestHandler<GetTalentPoolQuery, IEnumerable<TalentPoolEntryDto>>
{
    public async Task<IEnumerable<TalentPoolEntryDto>> Handle(GetTalentPoolQuery request, CancellationToken ct)
    {
        var entries = await repository.GetAllAsync(ct);
        return entries.Select(MapToDto);
    }

    internal static TalentPoolEntryDto MapToDto(TalentPoolEntry e) => new(
        e.Id,
        e.UserId,
        e.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty,
        e.User?.Email ?? string.Empty,
        e.User?.Profile?.PhoneNumber,
        e.OriginalApplication?.Rating,
        e.OriginalApplication?.RatingNote,
        e.OriginalApplication?.JobPost?.Title ?? string.Empty,
        e.OriginalApplicationId,
        e.OriginalApplication?.Code ?? string.Empty,
        e.Notes,
        e.AddedAt,
        e.AddedByUser is { } ab ? $"{ab.FirstName} {ab.LastName}".Trim() : string.Empty);
}
