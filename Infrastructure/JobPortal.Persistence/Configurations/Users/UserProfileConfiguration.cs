using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.Property(p => p.NIK).HasMaxLength(20).IsRequired();
        builder.Property(p => p.PhoneNumber).HasMaxLength(20).IsRequired();
        builder.Property(p => p.BirthPlace).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Gender).HasMaxLength(20).IsRequired();
        builder.Property(p => p.MaritalStatus).HasMaxLength(30).IsRequired();
        builder.Property(p => p.ProfilePicture).HasMaxLength(500);

        builder.HasIndex(p => p.NIK).IsUnique();
    }
}
