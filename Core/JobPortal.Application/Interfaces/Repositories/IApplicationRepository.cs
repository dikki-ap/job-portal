using JobPortal.Application.DTOs;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IApplicationRepository
{
    Task<IEnumerable<ApplicationEntity>> GetAllAsync(int? jobPostId = null, string? status = null, CancellationToken cancellationToken = default);
    Task<ApplicationEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApplicationEntity?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<ApplicationEntity>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationEntity>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationEntity>> GetByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationEntity>> GetAllByDepartmentAsync(IReadOnlyList<int> departmentIds, int? jobPostId = null, string? status = null, CancellationToken cancellationToken = default);
    Task<(IEnumerable<ApplicationEntity> Items, int TotalCount)> GetPagedAsync(
        int? jobPostId, string? status, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(IEnumerable<ApplicationEntity> Items, int TotalCount)> GetPagedByDepartmentAsync(
        IReadOnlyList<int> departmentIds, int? jobPostId, string? status, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int userId, int jobPostId, CancellationToken cancellationToken = default);
    Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApplicationEntity application, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    // Analytics
    Task<IEnumerable<ApplicationAnalyticsDto>> GetForAnalyticsAsync(CancellationToken ct = default);

    // Scope check (lightweight)
    Task<bool> IsInDepartmentScopeAsync(int applicationId, IReadOnlyList<int> departmentIds, CancellationToken ct = default);

    // Bulk operations
    Task<int> BulkRejectAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task<int> BulkAcceptAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task BulkSetInReviewAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default);
    Task BulkPassStepsAsync(IEnumerable<int> stepIds, DateTime completedAt, int? completedByUserId, string? completedByName, CancellationToken cancellationToken = default);
    Task BulkFailStepsAsync(IEnumerable<int> stepIds, DateTime completedAt, int? completedByUserId, string? completedByName, CancellationToken cancellationToken = default);
    Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default);
}
