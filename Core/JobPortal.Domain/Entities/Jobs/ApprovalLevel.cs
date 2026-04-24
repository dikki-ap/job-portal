using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Jobs;

public class ApprovalLevel : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public int LevelOrder { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public string ApproverEmail { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
