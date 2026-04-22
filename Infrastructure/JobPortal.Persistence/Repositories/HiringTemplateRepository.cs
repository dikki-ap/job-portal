using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class HiringTemplateRepository(ApplicationDbContext context) : IHiringTemplateRepository
{
    public async Task<IEnumerable<HiringTemplate>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.HiringTemplates
            .Include(t => t.Steps)
            .Include(t => t.CreatedByUser)
            .Include(t => t.UpdatedByUser)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

    public async Task<HiringTemplate?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.HiringTemplates
            .Include(t => t.Steps)
            .Include(t => t.CreatedByUser)
            .Include(t => t.UpdatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task AddAsync(HiringTemplate template, CancellationToken cancellationToken = default)
        => await context.HiringTemplates.AddAsync(template, cancellationToken);

    public Task UpdateAsync(HiringTemplate template, CancellationToken cancellationToken = default)
    {
        context.HiringTemplates.Update(template);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(HiringTemplate template, CancellationToken cancellationToken = default)
    {
        context.HiringTemplates.Remove(template);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
