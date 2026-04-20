using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class EducationLevel : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
}
