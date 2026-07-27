using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Jobs;

namespace JobPortal.Domain.Entities.Applications;

public class ApplicationStep : BaseEntity
{
    public int ApplicationId { get; set; }
    public int JobStepId { get; set; }
    public string StepName { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? CompletedAt { get; set; }
    public int? CompletedByUserId { get; set; }
    public string? CompletedByName { get; set; }

    public DateTime? ScheduledAt { get; set; }
    public string? ScheduledLocation { get; set; }
    public string? ScheduledNote { get; set; }

    public Application Application { get; set; } = null!;
    public JobStep JobStep { get; set; } = null!;
}
