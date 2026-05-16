using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Skills.Commands.DeleteSkill;

public class DeleteSkillCommandHandler(
    ISkillRepository repository,
    IMemoryCache cache,
    ILogger<DeleteSkillCommandHandler> logger)
    : IRequestHandler<DeleteSkillCommand, Unit>
{
    public async Task<Unit> Handle(DeleteSkillCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var skill = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Skill with ID {request.Id} not found.");
            await repository.DeleteAsync(skill, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.Skills);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting skill id={Id}", request.Id);
            throw;
        }
    }
}
