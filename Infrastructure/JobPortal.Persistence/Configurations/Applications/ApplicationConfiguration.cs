using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Applications;

public class ApplicationConfiguration : IEntityTypeConfiguration<Domain.Entities.Applications.Application>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Applications.Application> builder)
    {
        builder.HasQueryFilter(a => !a.IsDeleted);

        builder.HasIndex(a => new { a.UserId, a.JobPostId }).IsUnique();

        builder.Property(a => a.Code).HasMaxLength(60).IsRequired().HasDefaultValue(string.Empty);
        builder.HasIndex(a => a.Code).IsUnique();

        builder.Property(a => a.Status).HasMaxLength(50).IsRequired();

        builder.HasMany(a => a.Documents)
            .WithOne(d => d.Application)
            .HasForeignKey(d => d.ApplicationId);

        builder.HasMany(a => a.Steps)
            .WithOne(s => s.Application)
            .HasForeignKey(s => s.ApplicationId);
    }
}
