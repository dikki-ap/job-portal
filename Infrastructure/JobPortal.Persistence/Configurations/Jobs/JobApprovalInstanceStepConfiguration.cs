using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobApprovalInstanceStepConfiguration : IEntityTypeConfiguration<JobApprovalInstanceStep>
{
    public void Configure(EntityTypeBuilder<JobApprovalInstanceStep> builder)
    {
        builder.Property(s => s.ApproverEmail).HasMaxLength(320).IsRequired();
        builder.Property(s => s.ApproverName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Status).HasMaxLength(50).IsRequired();
        builder.Property(s => s.Comment).HasMaxLength(1000);
    }
}
