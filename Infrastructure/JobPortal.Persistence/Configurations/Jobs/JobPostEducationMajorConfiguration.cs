using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobPostEducationMajorConfiguration : IEntityTypeConfiguration<JobPostEducationMajor>
{
    public void Configure(EntityTypeBuilder<JobPostEducationMajor> builder)
    {
        builder.ToTable("JobPostEducationMajors");
        builder.HasIndex(e => new { e.JobPostId, e.EducationMajorId }).IsUnique();
        builder.HasOne(e => e.EducationMajor)
            .WithMany()
            .HasForeignKey(e => e.EducationMajorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
