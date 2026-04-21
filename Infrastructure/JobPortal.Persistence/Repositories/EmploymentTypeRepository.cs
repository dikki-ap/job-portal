using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class EmploymentTypeRepository(ApplicationDbContext context) : IEmploymentTypeRepository
{
    public async Task<IEnumerable<EmploymentType>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.EmploymentTypes
            .Include(e => e.CreatedByUser)
            .Include(e => e.UpdatedByUser)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);

    public async Task<EmploymentType?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.EmploymentTypes
            .Include(e => e.CreatedByUser)
            .Include(e => e.UpdatedByUser)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.EmploymentTypes.AnyAsync(
            e => e.Name == name && (excludeId == null || e.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(EmploymentType employmentType, CancellationToken cancellationToken = default)
        => await context.EmploymentTypes.AddAsync(employmentType, cancellationToken);

    public Task UpdateAsync(EmploymentType employmentType, CancellationToken cancellationToken = default)
    {
        context.EmploymentTypes.Update(employmentType);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(EmploymentType employmentType, CancellationToken cancellationToken = default)
    {
        context.EmploymentTypes.Remove(employmentType);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
