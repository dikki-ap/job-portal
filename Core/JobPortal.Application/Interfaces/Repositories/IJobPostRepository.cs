using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IJobPostRepository
{
    Task<JobPost?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<JobPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobPost>> GetAllPublishedAsync(CancellationToken cancellationToken = default);
    Task<(IEnumerable<JobPost> Items, int TotalCount)> GetPublishedPagedAsync(string? search, IReadOnlyList<int>? categoryIds, IReadOnlyList<int>? employmentTypeIds, IReadOnlyList<int>? workModeIds, IReadOnlyList<string>? countries, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetPublishedCountriesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<JobPost>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(JobPost jobPost, CancellationToken cancellationToken = default);
    Task UpdateAsync(JobPost jobPost, CancellationToken cancellationToken = default);
    Task DeleteAsync(JobPost jobPost, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<HashSet<int>> GetReferencedJobStepIdsAsync(IEnumerable<int> stepIds, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
