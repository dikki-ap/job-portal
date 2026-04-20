using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Users;

public class UserDocument : AuditableEntity
{
    public int UserId { get; set; }
    public int DocumentTypeId { get; set; }
    public int DocumentId { get; set; }
    public string? DocumentNumber { get; set; }
    public DateTime? IssueDate { get; set; }
    public bool IsExpired { get; set; }
    public DateTime? ExpiredDate { get; set; }

    public User User { get; set; } = null!;
    public DocumentType DocumentType { get; set; } = null!;
    public Document Document { get; set; } = null!;
}
