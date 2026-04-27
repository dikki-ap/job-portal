using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.Property(p => p.NIK).HasMaxLength(20).IsRequired();
        builder.Property(p => p.PhoneNumber).HasMaxLength(25).IsRequired();

        builder.HasIndex(p => p.NIK).IsUnique();

        builder.Property(p => p.EducationMajorCustom).HasMaxLength(255);

        builder.HasOne(p => p.EducationLevel)
            .WithMany()
            .HasForeignKey(p => p.EducationLevelId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.EducationMajor)
            .WithMany()
            .HasForeignKey(p => p.EducationMajorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.CvDocument)
            .WithMany()
            .HasForeignKey(p => p.CvDocumentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
