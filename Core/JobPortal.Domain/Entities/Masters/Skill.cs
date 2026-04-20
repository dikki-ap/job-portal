using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class Skill : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<UserSkill> UserSkills { get; set; } = [];
}
