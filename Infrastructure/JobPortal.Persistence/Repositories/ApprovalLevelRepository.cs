using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class ApprovalLevelRepository(ApplicationDbContext context) : IApprovalLevelRepository
{
    public async Task<IEnumerable<ApprovalLevel>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.ApprovalLevels
            .Include(a => a.CreatedByUser)
            .OrderBy(a => a.LevelOrder)
            .ToListAsync(cancellationToken);

    public async Task<ApprovalLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.ApprovalLevels
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IEnumerable<ApprovalLevel>> GetActiveOrderedAsync(CancellationToken cancellationToken = default)
        => await context.ApprovalLevels
            .Where(a => a.IsActive)
            .OrderBy(a => a.LevelOrder)
            .ToListAsync(cancellationToken);

    public async Task<bool> AnyActiveForEmailAsync(string email, CancellationToken cancellationToken = default)
        => await context.ApprovalLevels
            .AnyAsync(a => a.IsActive && a.ApproverEmail == email, cancellationToken);

    public async Task AddAsync(ApprovalLevel level, CancellationToken cancellationToken = default)
        => await context.ApprovalLevels.AddAsync(level, cancellationToken);

    public Task UpdateAsync(ApprovalLevel level, CancellationToken cancellationToken = default)
    {
        context.ApprovalLevels.Update(level);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(ApprovalLevel level, CancellationToken cancellationToken = default)
    {
        context.ApprovalLevels.Remove(level);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
