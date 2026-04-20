using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobStepConfiguration : IEntityTypeConfiguration<JobStep>
{
    public void Configure(EntityTypeBuilder<JobStep> builder)
    {
        builder.Property(s => s.Name).HasMaxLength(150).IsRequired();
    }
}
