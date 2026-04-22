using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobPostSkillConfiguration : IEntityTypeConfiguration<JobPostSkill>
{
    public void Configure(EntityTypeBuilder<JobPostSkill> builder)
    {
        builder.ToTable("JobPostSkills");
        builder.HasIndex(e => new { e.JobPostId, e.SkillId }).IsUnique();
        builder.HasOne(e => e.Skill)
            .WithMany()
            .HasForeignKey(e => e.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
