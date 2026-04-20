using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class EmploymentType : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
}
