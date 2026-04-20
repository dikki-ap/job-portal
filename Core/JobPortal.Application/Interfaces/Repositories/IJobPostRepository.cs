using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IJobPostRepository
{
    Task<JobPost?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<JobPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobPost>> GetAllPublishedAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<JobPost>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(JobPost jobPost, CancellationToken cancellationToken = default);
    Task UpdateAsync(JobPost jobPost, CancellationToken cancellationToken = default);
    Task DeleteAsync(JobPost jobPost, CancellationToken cancellationToken = default);
}
