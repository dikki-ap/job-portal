using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IWorkModeRepository
{
    Task<IEnumerable<WorkMode>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<WorkMode?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(WorkMode workMode, CancellationToken cancellationToken = default);
    Task UpdateAsync(WorkMode workMode, CancellationToken cancellationToken = default);
    Task DeleteAsync(WorkMode workMode, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
