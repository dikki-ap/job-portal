using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class JobCategoryRepository(ApplicationDbContext context) : IJobCategoryRepository
{
    public async Task<IEnumerable<JobCategory>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.JobCategories
            .Include(j => j.CreatedByUser)
            .Include(j => j.UpdatedByUser)
            .OrderBy(j => j.Name)
            .ToListAsync(cancellationToken);

    public async Task<JobCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.JobCategories
            .Include(j => j.CreatedByUser)
            .Include(j => j.UpdatedByUser)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.JobCategories.AnyAsync(
            j => j.Name == name && (excludeId == null || j.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(JobCategory jobCategory, CancellationToken cancellationToken = default)
        => await context.JobCategories.AddAsync(jobCategory, cancellationToken);

    public Task UpdateAsync(JobCategory jobCategory, CancellationToken cancellationToken = default)
    {
        context.JobCategories.Update(jobCategory);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(JobCategory jobCategory, CancellationToken cancellationToken = default)
    {
        context.JobCategories.Remove(jobCategory);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
