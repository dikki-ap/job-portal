using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class DepartmentManagerRepository(ApplicationDbContext context) : IDepartmentManagerRepository
{
    public async Task<IEnumerable<DepartmentManager>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.DepartmentManagers
            .Include(m => m.Department)
            .Include(m => m.CreatedByUser)
            .Include(m => m.UpdatedByUser)
            .OrderBy(m => m.Department!.Name)
            .ThenBy(m => m.FullName)
            .ToListAsync(cancellationToken);

    public async Task<DepartmentManager?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.DepartmentManagers
            .Include(m => m.Department)
            .Include(m => m.CreatedByUser)
            .Include(m => m.UpdatedByUser)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

    public async Task<DepartmentManager?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await context.DepartmentManagers
            .Include(m => m.Department)
            .FirstOrDefaultAsync(m => m.Email == email.Trim().ToLowerInvariant(), cancellationToken);

    public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.DepartmentManagers.AnyAsync(
            m => m.Email == email.Trim().ToLowerInvariant() && (excludeId == null || m.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default)
        => await context.DepartmentManagers.AddAsync(departmentManager, cancellationToken);

    public Task UpdateAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default)
    {
        context.DepartmentManagers.Update(departmentManager);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default)
    {
        context.DepartmentManagers.Remove(departmentManager);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
