using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Documents;

namespace JobPortal.Domain.Entities.Applications;

public class ApplicationDocument : BaseEntity
{
    public int ApplicationId { get; set; }
    public int DocumentId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int CreatedByUserId { get; set; }

    public Application Application { get; set; } = null!;
    public Document Document { get; set; } = null!;
}
