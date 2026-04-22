using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class HiringTemplateConfiguration : IEntityTypeConfiguration<HiringTemplate>
{
    public void Configure(EntityTypeBuilder<HiringTemplate> builder)
    {
        builder.Property(t => t.Name).HasMaxLength(150).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(500);

        builder.HasMany(t => t.Steps)
            .WithOne(s => s.HiringTemplate)
            .HasForeignKey(s => s.HiringTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
