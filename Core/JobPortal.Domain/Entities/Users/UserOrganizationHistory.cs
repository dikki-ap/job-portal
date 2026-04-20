using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Users;

public class UserOrganizationHistory : AuditableEntity
{
    public int UserId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string OrganizationType { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public User User { get; set; } = null!;
}
