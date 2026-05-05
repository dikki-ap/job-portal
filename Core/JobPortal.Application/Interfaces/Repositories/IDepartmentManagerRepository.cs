using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IDepartmentManagerRepository
{
    Task<IEnumerable<DepartmentManager>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<DepartmentManager?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DepartmentManager?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default);
    Task UpdateAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default);
    Task DeleteAsync(DepartmentManager departmentManager, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
