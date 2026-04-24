using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IJobApprovalRepository
{
    Task<JobApprovalInstance?> GetActiveInstanceByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default);
    Task<JobApprovalInstance?> GetLatestInstanceByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default);
    Task<IEnumerable<JobApprovalInstance>> GetPendingInstancesForApproverAsync(string approverEmail, CancellationToken cancellationToken = default);
    Task AddInstanceAsync(JobApprovalInstance instance, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
