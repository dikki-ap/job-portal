using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class AppSettingRepository(ApplicationDbContext context) : IAppSettingRepository
{
    public async Task<string?> GetValueAsync(string key, CancellationToken cancellationToken = default)
        => (await context.AppSettings.FirstOrDefaultAsync(s => s.Key == key, cancellationToken))?.Value;

    public async Task<Dictionary<string, string?>> GetManyAsync(
        IEnumerable<string> keys, CancellationToken cancellationToken = default)
    {
        var keyList = keys.ToList();
        var settings = await context.AppSettings
            .Where(s => keyList.Contains(s.Key))
            .ToListAsync(cancellationToken);
        return keyList.ToDictionary(k => k, k => settings.FirstOrDefault(s => s.Key == k)?.Value);
    }

    public async Task SetValueAsync(string key, string value, int? updatedByUserId, CancellationToken cancellationToken = default)
    {
        var setting = await context.AppSettings.FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
        if (setting is null)
        {
            setting = new AppSetting { Key = key };
            await context.AppSettings.AddAsync(setting, cancellationToken);
        }
        setting.Value = value;
        setting.UpdatedAt = DateTime.UtcNow;
        setting.UpdatedByUserId = updatedByUserId;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
