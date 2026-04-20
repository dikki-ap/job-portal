using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Domain.Entities.Jobs;

public class JobStep : AuditableEntity
{
    public int JobPostId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsRequired { get; set; } = true;

    public JobPost JobPost { get; set; } = null!;
    public ICollection<ApplicationStep> ApplicationSteps { get; set; } = [];
}
