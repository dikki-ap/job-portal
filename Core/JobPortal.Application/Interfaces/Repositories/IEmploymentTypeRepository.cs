using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IEmploymentTypeRepository
{
    Task<IEnumerable<EmploymentType>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EmploymentType?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(EmploymentType employmentType, CancellationToken cancellationToken = default);
    Task UpdateAsync(EmploymentType employmentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(EmploymentType employmentType, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
