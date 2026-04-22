using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IHiringTemplateRepository
{
    Task<IEnumerable<HiringTemplate>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HiringTemplate?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(HiringTemplate template, CancellationToken cancellationToken = default);
    Task UpdateAsync(HiringTemplate template, CancellationToken cancellationToken = default);
    Task DeleteAsync(HiringTemplate template, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
