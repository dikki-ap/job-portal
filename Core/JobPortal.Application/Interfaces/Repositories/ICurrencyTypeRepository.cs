using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface ICurrencyTypeRepository
{
    Task<IEnumerable<CurrencyType>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CurrencyType?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(CurrencyType currencyType, CancellationToken cancellationToken = default);
    Task UpdateAsync(CurrencyType currencyType, CancellationToken cancellationToken = default);
    Task DeleteAsync(CurrencyType currencyType, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
