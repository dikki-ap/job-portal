using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Users;

public class UserSkill : AuditableEntity
{
    public int UserId { get; set; }
    public int SkillId { get; set; }
    public string SkillLevel { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
