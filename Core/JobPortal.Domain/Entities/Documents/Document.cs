using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Documents;

public class Document : AuditableEntity
{
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
}
