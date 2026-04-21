using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class CurrencyTypeRepository(ApplicationDbContext context) : ICurrencyTypeRepository
{
    public async Task<IEnumerable<CurrencyType>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.CurrencyTypes
            .Include(c => c.CreatedByUser)
            .Include(c => c.UpdatedByUser)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

    public async Task<CurrencyType?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.CurrencyTypes
            .Include(c => c.CreatedByUser)
            .Include(c => c.UpdatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.CurrencyTypes.AnyAsync(
            c => c.Name == name && (excludeId == null || c.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(CurrencyType currencyType, CancellationToken cancellationToken = default)
        => await context.CurrencyTypes.AddAsync(currencyType, cancellationToken);

    public Task UpdateAsync(CurrencyType currencyType, CancellationToken cancellationToken = default)
    {
        context.CurrencyTypes.Update(currencyType);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(CurrencyType currencyType, CancellationToken cancellationToken = default)
    {
        context.CurrencyTypes.Remove(currencyType);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
