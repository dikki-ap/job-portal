using JobPortal.Domain.Entities.TalentPool;

namespace JobPortal.Application.Interfaces.Repositories;

public interface ITalentPoolRepository
{
    Task<IEnumerable<TalentPoolEntry>> GetAllAsync(CancellationToken ct = default);
    Task<TalentPoolEntry?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<TalentPoolEntry?> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task AddAsync(TalentPoolEntry entry, CancellationToken ct = default);
    void Remove(TalentPoolEntry entry);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
