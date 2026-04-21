using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IEducationMajorRepository
{
    Task<IEnumerable<EducationMajor>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<EducationMajor?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default);
    Task UpdateAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default);
    Task DeleteAsync(EducationMajor educationMajor, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
