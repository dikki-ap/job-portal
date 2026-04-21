using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class EducationLevelRepository(ApplicationDbContext context) : IEducationLevelRepository
{
    public async Task<IEnumerable<EducationLevel>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.EducationLevels
            .Include(e => e.CreatedByUser)
            .Include(e => e.UpdatedByUser)
            .OrderBy(e => e.Level)
            .ToListAsync(cancellationToken);

    public async Task<EducationLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.EducationLevels
            .Include(e => e.CreatedByUser)
            .Include(e => e.UpdatedByUser)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.EducationLevels.AnyAsync(
            e => e.Name == name && (excludeId == null || e.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default)
        => await context.EducationLevels.AddAsync(educationLevel, cancellationToken);

    public Task UpdateAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default)
    {
        context.EducationLevels.Update(educationLevel);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default)
    {
        context.EducationLevels.Remove(educationLevel);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
