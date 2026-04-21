using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class SkillRepository(ApplicationDbContext context) : ISkillRepository
{
    public async Task<IEnumerable<Skill>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Skills
            .Include(s => s.CreatedByUser)
            .Include(s => s.UpdatedByUser)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

    public async Task<Skill?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.Skills
            .Include(s => s.CreatedByUser)
            .Include(s => s.UpdatedByUser)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.Skills.AnyAsync(
            s => s.Name == name && (excludeId == null || s.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(Skill skill, CancellationToken cancellationToken = default)
        => await context.Skills.AddAsync(skill, cancellationToken);

    public Task UpdateAsync(Skill skill, CancellationToken cancellationToken = default)
    {
        context.Skills.Update(skill);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Skill skill, CancellationToken cancellationToken = default)
    {
        context.Skills.Remove(skill);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
