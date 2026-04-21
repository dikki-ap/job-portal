using System.Text.Json;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace JobPortal.Persistence.Interceptors;

public class AuditInterceptor(ICurrentUserService currentUserService) : SaveChangesInterceptor
{
    private bool _isWritingAudit;
    private readonly List<(EntityEntry Entry, string TableName)> _pendingAdded = new();

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (_isWritingAudit)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        var userId = currentUserService.GetCurrentUserId();
        if (userId is null)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        var context = eventData.Context!;
        var now = DateTime.UtcNow;
        _pendingAdded.Clear();

        foreach (var entry in context.ChangeTracker.Entries()
            .Where(e => e.Entity is AuditableEntity && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList())
        {
            var tableName = context.Model.FindEntityType(entry.Entity.GetType())?.GetTableName() ?? entry.Entity.GetType().Name;

            if (entry.State == EntityState.Added)
            {
                _pendingAdded.Add((entry, tableName));
                continue;
            }

            var auditLog = new AuditLog
            {
                TableName = tableName,
                RecordId = (int)(entry.Property("Id").CurrentValue ?? 0),
                Action = entry.State == EntityState.Modified ? "Update" : "Delete",
                OldValue = SerializeValues(entry.OriginalValues),
                NewValue = entry.State == EntityState.Modified ? SerializeValues(entry.CurrentValues) : null,
                ChangedByUserId = userId.Value,
                ChangedAt = now,
            };
            context.Set<AuditLog>().Add(auditLog);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (_pendingAdded.Count > 0 && !_isWritingAudit)
        {
            var userId = currentUserService.GetCurrentUserId();
            if (userId is not null)
            {
                var context = eventData.Context!;
                var now = DateTime.UtcNow;

                foreach (var (entry, tableName) in _pendingAdded)
                {
                    context.Set<AuditLog>().Add(new AuditLog
                    {
                        TableName = tableName,
                        RecordId = (int)(entry.Property("Id").CurrentValue ?? 0),
                        Action = "Create",
                        OldValue = null,
                        NewValue = SerializeValues(entry.CurrentValues),
                        ChangedByUserId = userId.Value,
                        ChangedAt = now,
                    });
                }

                _isWritingAudit = true;
                _pendingAdded.Clear();
                await context.SaveChangesAsync(cancellationToken);
                _isWritingAudit = false;
            }
        }

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    private static string SerializeValues(PropertyValues values)
    {
        var dict = values.Properties
            .ToDictionary(p => p.Name, p => values[p]);
        return JsonSerializer.Serialize(dict);
    }
}
