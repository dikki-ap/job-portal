using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Jobs;

public class JobPostRequiredDocument : BaseEntity
{
    public int JobPostId { get; set; }
    public int DocumentTypeId { get; set; }
    public bool IsRequired { get; set; } = true;

    public JobPost JobPost { get; set; } = null!;
    public DocumentType DocumentType { get; set; } = null!;
}
