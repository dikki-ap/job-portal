using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class WorkModeRepository(ApplicationDbContext context) : IWorkModeRepository
{
    public async Task<IEnumerable<WorkMode>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.WorkModes
            .Include(w => w.CreatedByUser)
            .Include(w => w.UpdatedByUser)
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);

    public async Task<WorkMode?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.WorkModes
            .Include(w => w.CreatedByUser)
            .Include(w => w.UpdatedByUser)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.WorkModes.AnyAsync(
            w => w.Name == name && (excludeId == null || w.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(WorkMode workMode, CancellationToken cancellationToken = default)
        => await context.WorkModes.AddAsync(workMode, cancellationToken);

    public Task UpdateAsync(WorkMode workMode, CancellationToken cancellationToken = default)
    {
        context.WorkModes.Update(workMode);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(WorkMode workMode, CancellationToken cancellationToken = default)
    {
        context.WorkModes.Remove(workMode);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
