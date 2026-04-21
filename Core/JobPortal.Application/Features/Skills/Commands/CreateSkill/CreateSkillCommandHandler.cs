using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Commands.CreateSkill;

public class CreateSkillCommandHandler(
    ISkillRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateSkillCommandHandler> logger)
    : IRequestHandler<CreateSkillCommand, SkillDto>
{
    public async Task<SkillDto> Handle(CreateSkillCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var skill = new Skill
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(skill, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return new SkillDto(skill.Id, skill.Name, skill.CreatedAt, skill.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating skill name={Name}", request.Name);
            throw;
        }
    }
}
