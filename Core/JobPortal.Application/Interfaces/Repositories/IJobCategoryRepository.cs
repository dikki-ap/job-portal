using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IJobCategoryRepository
{
    Task<IEnumerable<JobCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<JobCategory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(JobCategory jobCategory, CancellationToken cancellationToken = default);
    Task UpdateAsync(JobCategory jobCategory, CancellationToken cancellationToken = default);
    Task DeleteAsync(JobCategory jobCategory, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
