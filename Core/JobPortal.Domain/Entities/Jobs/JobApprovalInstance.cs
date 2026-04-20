using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Jobs;

public class JobApprovalInstance : BaseEntity
{
    public int JobPostId { get; set; }
    public int CurrentStepOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedByUserId { get; set; }

    public JobPost JobPost { get; set; } = null!;
    public ICollection<JobApprovalInstanceStep> Steps { get; set; } = [];
}
