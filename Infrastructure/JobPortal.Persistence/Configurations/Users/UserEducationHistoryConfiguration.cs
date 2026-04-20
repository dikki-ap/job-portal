using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserEducationHistoryConfiguration : IEntityTypeConfiguration<UserEducationHistory>
{
    public void Configure(EntityTypeBuilder<UserEducationHistory> builder)
    {
        builder.Property(e => e.InstitutionName).HasMaxLength(255).IsRequired();
        builder.Property(e => e.CertificateNumber).HasMaxLength(100);

        builder.HasOne(e => e.EducationLevel)
            .WithMany()
            .HasForeignKey(e => e.EducationLevelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.EducationMajor)
            .WithMany()
            .HasForeignKey(e => e.EducationMajorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
