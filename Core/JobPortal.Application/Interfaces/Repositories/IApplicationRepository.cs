using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IApplicationRepository
{
    Task<IEnumerable<ApplicationEntity>> GetAllAsync(int? jobPostId = null, string? status = null, CancellationToken cancellationToken = default);
    Task<ApplicationEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationEntity>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationEntity>> GetByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int userId, int jobPostId, CancellationToken cancellationToken = default);
    Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
