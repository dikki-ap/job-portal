using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasQueryFilter(u => !u.IsDeleted);

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.ExternalId).IsUnique();

        builder.Property(u => u.ExternalId).HasMaxLength(255).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(255).IsRequired();
        builder.Property(u => u.FullName).HasMaxLength(255).IsRequired();

        builder.HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<UserProfile>(p => p.UserId);

        builder.HasMany(u => u.Addresses)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId);

        builder.HasMany(u => u.EducationHistories)
            .WithOne(e => e.User)
            .HasForeignKey(e => e.UserId);

        builder.HasMany(u => u.WorkHistories)
            .WithOne(w => w.User)
            .HasForeignKey(w => w.UserId);

        builder.HasMany(u => u.OrganizationHistories)
            .WithOne(o => o.User)
            .HasForeignKey(o => o.UserId);

        builder.HasMany(u => u.Skills)
            .WithOne(s => s.User)
            .HasForeignKey(s => s.UserId);

        builder.HasMany(u => u.Documents)
            .WithOne(d => d.User)
            .HasForeignKey(d => d.UserId);

        builder.HasMany(u => u.Applications)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId);
    }
}
