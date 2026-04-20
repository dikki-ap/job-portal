using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Users;

namespace JobPortal.Domain.Entities.Audit;

public class AuditLog : BaseEntity
{
    public string TableName { get; set; } = string.Empty;
    public int RecordId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public int ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; }

    public User ChangedBy { get; set; } = null!;
}
