using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class DepartmentRepository(ApplicationDbContext context) : IDepartmentRepository
{
    public async Task<IEnumerable<Department>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Departments
            .Include(d => d.CreatedByUser)
            .Include(d => d.UpdatedByUser)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);

    public async Task<Department?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.Departments
            .Include(d => d.CreatedByUser)
            .Include(d => d.UpdatedByUser)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.Departments.AnyAsync(
            d => d.Name == name && (excludeId == null || d.Id != excludeId),
            cancellationToken);

    public async Task<bool> AreAllIdsValidAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();
        var count = await context.Departments
            .CountAsync(d => idList.Contains(d.Id), cancellationToken);
        return count == idList.Count;
    }

    public async Task AddAsync(Department department, CancellationToken cancellationToken = default)
        => await context.Departments.AddAsync(department, cancellationToken);

    public Task UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        context.Departments.Update(department);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Department department, CancellationToken cancellationToken = default)
    {
        context.Departments.Remove(department);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
