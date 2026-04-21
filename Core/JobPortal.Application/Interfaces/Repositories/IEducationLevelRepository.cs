using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IEducationLevelRepository
{
    Task<IEnumerable<EducationLevel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EducationLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default);
    Task UpdateAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default);
    Task DeleteAsync(EducationLevel educationLevel, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
