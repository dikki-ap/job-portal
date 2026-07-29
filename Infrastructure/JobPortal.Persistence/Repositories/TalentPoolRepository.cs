using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.TalentPool;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class TalentPoolRepository(ApplicationDbContext context) : ITalentPoolRepository
{
    public async Task<IEnumerable<TalentPoolEntry>> GetAllAsync(CancellationToken ct = default)
        => await context.TalentPoolEntries
            .Include(e => e.User).ThenInclude(u => u.Profile)
            .Include(e => e.OriginalApplication).ThenInclude(a => a.JobPost)
            .Include(e => e.AddedByUser)
            .OrderByDescending(e => e.AddedAt)
            .ToListAsync(ct);

    public async Task<(IEnumerable<TalentPoolEntry> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var query = context.TalentPoolEntries
            .Include(e => e.User).ThenInclude(u => u.Profile)
            .Include(e => e.OriginalApplication).ThenInclude(a => a.JobPost)
            .Include(e => e.AddedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(e =>
                (e.User.FirstName + " " + e.User.LastName).Contains(search) ||
                e.User.Email.Contains(search));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(e => e.AddedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<TalentPoolEntry?> GetByIdAsync(int id, CancellationToken ct = default)
        => await context.TalentPoolEntries
            .Include(e => e.User).ThenInclude(u => u.Profile)
            .Include(e => e.OriginalApplication).ThenInclude(a => a.JobPost)
            .Include(e => e.AddedByUser)
            .FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<TalentPoolEntry?> GetByUserIdAsync(int userId, CancellationToken ct = default)
        => await context.TalentPoolEntries.FirstOrDefaultAsync(e => e.UserId == userId, ct);

    public async Task AddAsync(TalentPoolEntry entry, CancellationToken ct = default)
        => await context.TalentPoolEntries.AddAsync(entry, ct);

    public void Remove(TalentPoolEntry entry)
        => context.TalentPoolEntries.Remove(entry);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await context.SaveChangesAsync(ct);
}
