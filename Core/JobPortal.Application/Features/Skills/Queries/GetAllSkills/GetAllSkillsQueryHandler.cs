using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Queries.GetAllSkills;

public class GetAllSkillsQueryHandler(
    ISkillRepository repository,
    IMemoryCache cache,
    ILogger<GetAllSkillsQueryHandler> logger)
    : IRequestHandler<GetAllSkillsQuery, IEnumerable<SkillDto>>
{
    public async Task<IEnumerable<SkillDto>> Handle(GetAllSkillsQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.Skills, out IEnumerable<SkillDto>? cached) && cached is not null)
            return cached;

        try
        {
            var skills = await repository.GetAllAsync(cancellationToken);
            var result = skills.Select(s => new SkillDto(
                s.Id, s.Name, s.CreatedAt, s.CreatedByUserId,
                s.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                s.UpdatedAt, s.UpdatedByUserId,
                s.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.Skills, (IEnumerable<SkillDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all skills");
            throw;
        }
    }
}
