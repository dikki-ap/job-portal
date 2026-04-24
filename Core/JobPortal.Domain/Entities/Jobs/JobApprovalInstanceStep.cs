using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Jobs;

public class JobApprovalInstanceStep : BaseEntity
{
    public int ApprovalInstanceId { get; set; }
    public int StepOrder { get; set; }
    public string ApproverEmail { get; set; } = string.Empty;
    public string ApproverName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ActionAt { get; set; }
    public string? Comment { get; set; }

    public JobApprovalInstance ApprovalInstance { get; set; } = null!;
}
