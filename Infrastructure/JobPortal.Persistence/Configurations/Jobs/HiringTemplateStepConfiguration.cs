using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class HiringTemplateStepConfiguration : IEntityTypeConfiguration<HiringTemplateStep>
{
    public void Configure(EntityTypeBuilder<HiringTemplateStep> builder)
    {
        builder.ToTable("HiringTemplateSteps");
        builder.Property(s => s.Name).HasMaxLength(150).IsRequired();
    }
}
