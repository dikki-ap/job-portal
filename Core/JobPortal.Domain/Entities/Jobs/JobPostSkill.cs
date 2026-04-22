using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Jobs;

public class JobPostSkill
{
    public int Id { get; set; }
    public int JobPostId { get; set; }
    public int SkillId { get; set; }
    public JobPost JobPost { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}
