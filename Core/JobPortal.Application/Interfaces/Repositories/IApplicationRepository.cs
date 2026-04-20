using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IApplicationRepository
{
    Task<Application?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Application>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Application>> GetByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int userId, int jobPostId, CancellationToken cancellationToken = default);
    Task AddAsync(Application application, CancellationToken cancellationToken = default);
    Task UpdateAsync(Application application, CancellationToken cancellationToken = default);
}
