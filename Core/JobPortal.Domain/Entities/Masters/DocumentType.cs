using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class DocumentType : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public int MaxFileSizeMb { get; set; }
    public ICollection<DocumentTypeMimeType> MimeTypes { get; set; } = new List<DocumentTypeMimeType>();
}

public class DocumentTypeMimeType
{
    public int Id { get; set; }
    public int DocumentTypeId { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public DocumentType DocumentType { get; set; } = null!;
}
