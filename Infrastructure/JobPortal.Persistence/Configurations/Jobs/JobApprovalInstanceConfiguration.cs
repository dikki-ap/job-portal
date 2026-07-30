using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobApprovalInstanceConfiguration : IEntityTypeConfiguration<JobApprovalInstance>
{
    public void Configure(EntityTypeBuilder<JobApprovalInstance> builder)
    {
        builder.Property(a => a.Status).HasMaxLength(50).IsRequired();

        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.JobPostId);
        builder.HasIndex(a => new { a.JobPostId, a.Status });

        builder.HasMany(a => a.Steps)
            .WithOne(s => s.ApprovalInstance)
            .HasForeignKey(s => s.ApprovalInstanceId);
    }
}
