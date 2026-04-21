using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class JobLevelRepository(ApplicationDbContext context) : IJobLevelRepository
{
    public async Task<IEnumerable<JobLevel>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.JobLevels
            .Include(j => j.CreatedByUser)
            .Include(j => j.UpdatedByUser)
            .OrderBy(j => j.Name)
            .ToListAsync(cancellationToken);

    public async Task<JobLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.JobLevels
            .Include(j => j.CreatedByUser)
            .Include(j => j.UpdatedByUser)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.JobLevels.AnyAsync(
            j => j.Name == name && (excludeId == null || j.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(JobLevel jobLevel, CancellationToken cancellationToken = default)
        => await context.JobLevels.AddAsync(jobLevel, cancellationToken);

    public Task UpdateAsync(JobLevel jobLevel, CancellationToken cancellationToken = default)
    {
        context.JobLevels.Update(jobLevel);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(JobLevel jobLevel, CancellationToken cancellationToken = default)
    {
        context.JobLevels.Remove(jobLevel);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
