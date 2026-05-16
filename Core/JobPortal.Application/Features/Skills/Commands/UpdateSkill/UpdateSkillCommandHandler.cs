using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Commands.UpdateSkill;

public class UpdateSkillCommandHandler(
    ISkillRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<UpdateSkillCommandHandler> logger)
    : IRequestHandler<UpdateSkillCommand, SkillDto>
{
    public async Task<SkillDto> Handle(UpdateSkillCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var skill = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Skill with ID {request.Id} not found.");

            skill.Name = request.Name;
            skill.UpdatedAt = DateTime.UtcNow;
            skill.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(skill, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.Skills);

            return new SkillDto(
                skill.Id, skill.Name, skill.CreatedAt, skill.CreatedByUserId,
                skill.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                skill.UpdatedAt, skill.UpdatedByUserId,
                skill.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating skill id={Id}", request.Id);
            throw;
        }
    }
}
