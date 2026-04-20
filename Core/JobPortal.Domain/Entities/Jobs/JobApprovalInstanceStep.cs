using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Users;

namespace JobPortal.Domain.Entities.Jobs;

public class JobApprovalInstanceStep : BaseEntity
{
    public int ApprovalInstanceId { get; set; }
    public int StepOrder { get; set; }
    public int ApproverUserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ActionAt { get; set; }
    public string? Comment { get; set; }

    public JobApprovalInstance ApprovalInstance { get; set; } = null!;
    public User Approver { get; set; } = null!;
}
