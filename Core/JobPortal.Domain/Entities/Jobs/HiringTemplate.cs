using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Jobs;

public class HiringTemplate : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<HiringTemplateStep> Steps { get; set; } = [];
}
