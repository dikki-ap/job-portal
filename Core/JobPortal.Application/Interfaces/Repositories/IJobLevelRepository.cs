using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IJobLevelRepository
{
    Task<IEnumerable<JobLevel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<JobLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(JobLevel jobLevel, CancellationToken cancellationToken = default);
    Task UpdateAsync(JobLevel jobLevel, CancellationToken cancellationToken = default);
    Task DeleteAsync(JobLevel jobLevel, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
