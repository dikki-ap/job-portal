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
        builder.Property(a => a.Source).HasMaxLength(50);
        builder.Property(a => a.RatingNote).HasMaxLength(2000);
        builder.Property(a => a.DmRatingNote).HasMaxLength(2000);

        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.JobPostId);
        builder.HasIndex(a => a.AppliedAt);
        builder.HasIndex(a => a.UserId);

        builder.HasMany(a => a.Documents)
            .WithOne(d => d.Application)
            .HasForeignKey(d => d.ApplicationId);

        builder.HasMany(a => a.Steps)
            .WithOne(s => s.Application)
            .HasForeignKey(s => s.ApplicationId);
    }
}
