namespace JobPortal.Domain.Entities.Masters;

public class DepartmentManagerDepartment
{
    public int DepartmentManagerId { get; set; }
    public DepartmentManager? DepartmentManager { get; set; }
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
}
