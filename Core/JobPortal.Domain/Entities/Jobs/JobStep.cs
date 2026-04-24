using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Domain.Entities.Jobs;

public class JobStep : AuditableEntity
{
    public int JobPostId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? PassEmailSubject { get; set; }
    public string? PassEmailBody { get; set; }
    public string? FailEmailSubject { get; set; }
    public string? FailEmailBody { get; set; }

    public JobPost JobPost { get; set; } = null!;
    public ICollection<ApplicationStep> ApplicationSteps { get; set; } = [];
}
