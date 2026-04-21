using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Queries.GetSkillById;

public class GetSkillByIdQueryHandler(ISkillRepository repository, ILogger<GetSkillByIdQueryHandler> logger)
    : IRequestHandler<GetSkillByIdQuery, SkillDto?>
{
    public async Task<SkillDto?> Handle(GetSkillByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var skill = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (skill is null) return null;

            return new SkillDto(
                skill.Id, skill.Name, skill.CreatedAt, skill.CreatedByUserId,
                skill.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                skill.UpdatedAt, skill.UpdatedByUserId,
                skill.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting skill id={Id}", request.Id);
            throw;
        }
    }
}
