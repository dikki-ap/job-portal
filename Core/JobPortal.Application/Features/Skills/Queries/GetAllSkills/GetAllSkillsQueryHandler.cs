using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Queries.GetAllSkills;

public class GetAllSkillsQueryHandler(ISkillRepository repository, ILogger<GetAllSkillsQueryHandler> logger)
    : IRequestHandler<GetAllSkillsQuery, IEnumerable<SkillDto>>
{
    public async Task<IEnumerable<SkillDto>> Handle(GetAllSkillsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var skills = await repository.GetAllAsync(cancellationToken);
            return skills.Select(s => new SkillDto(
                s.Id, s.Name, s.CreatedAt, s.CreatedByUserId,
                s.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                s.UpdatedAt, s.UpdatedByUserId,
                s.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all skills");
            throw;
        }
    }
}
