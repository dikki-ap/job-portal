using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class EducationMajorRepository(ApplicationDbContext context) : IEducationMajorRepository
{
    public async Task<IEnumerable<EducationMajor>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.EducationMajors
            .Include(m => m.CreatedByUser)
            .Include(m => m.UpdatedByUser)
            .OrderBy(m => m.Name)
            .ToListAsync(cancellationToken);

    public async Task<EducationMajor?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.EducationMajors
            .Include(m => m.CreatedByUser)
            .Include(m => m.UpdatedByUser)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.EducationMajors.AnyAsync(
            m => m.Name == name && (excludeId == null || m.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default)
        => await context.EducationMajors.AddAsync(educationMajor, cancellationToken);

    public Task UpdateAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default)
    {
        context.EducationMajors.Update(educationMajor);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default)
    {
        context.EducationMajors.Remove(educationMajor);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
