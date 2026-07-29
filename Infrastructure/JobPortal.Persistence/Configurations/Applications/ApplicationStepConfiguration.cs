using JobPortal.Domain.Entities.Applications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Applications;

public class ApplicationStepConfiguration : IEntityTypeConfiguration<ApplicationStep>
{
    public void Configure(EntityTypeBuilder<ApplicationStep> builder)
    {
        builder.Property(s => s.StepName).HasMaxLength(150).IsRequired();
        builder.Property(s => s.Status).HasMaxLength(50).IsRequired();

        builder.HasIndex(s => s.ApplicationId);
        builder.HasIndex(s => s.Status);

        builder.HasOne(s => s.JobStep)
            .WithMany(js => js.ApplicationSteps)
            .HasForeignKey(s => s.JobStepId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
