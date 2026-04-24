using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class ApprovalLevelConfiguration : IEntityTypeConfiguration<ApprovalLevel>
{
    public void Configure(EntityTypeBuilder<ApprovalLevel> builder)
    {
        builder.Property(a => a.Name).HasMaxLength(200).IsRequired();
        builder.Property(a => a.ApproverName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.ApproverEmail).HasMaxLength(320).IsRequired();

        builder.HasIndex(a => a.LevelOrder).IsUnique();
    }
}
