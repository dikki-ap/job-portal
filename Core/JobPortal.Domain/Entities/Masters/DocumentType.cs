using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class DocumentType : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
}
