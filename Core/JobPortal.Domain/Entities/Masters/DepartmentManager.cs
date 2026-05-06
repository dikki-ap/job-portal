using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class DepartmentManager : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ICollection<DepartmentManagerDepartment> Departments { get; set; } = [];
}
