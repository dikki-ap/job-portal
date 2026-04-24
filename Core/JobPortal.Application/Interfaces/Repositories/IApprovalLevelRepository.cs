using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IApprovalLevelRepository
{
    Task<IEnumerable<ApprovalLevel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ApprovalLevel?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ApprovalLevel>> GetActiveOrderedAsync(CancellationToken cancellationToken = default);
    Task<bool> AnyActiveForEmailAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(ApprovalLevel level, CancellationToken cancellationToken = default);
    Task UpdateAsync(ApprovalLevel level, CancellationToken cancellationToken = default);
    Task DeleteAsync(ApprovalLevel level, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
