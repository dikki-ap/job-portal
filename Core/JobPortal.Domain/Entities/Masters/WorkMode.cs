using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class WorkMode : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
}
