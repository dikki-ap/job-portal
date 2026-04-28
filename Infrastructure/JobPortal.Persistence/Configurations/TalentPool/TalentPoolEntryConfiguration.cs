using JobPortal.Domain.Entities.TalentPool;
using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Persistence.Configurations.TalentPool;

public class TalentPoolEntryConfiguration : IEntityTypeConfiguration<TalentPoolEntry>
{
    public void Configure(EntityTypeBuilder<TalentPoolEntry> builder)
    {
        builder.HasIndex(e => e.UserId).IsUnique();

        builder.Property(e => e.Notes).HasMaxLength(1000);

        builder.HasOne<User>(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ApplicationEntity>(e => e.OriginalApplication)
            .WithMany()
            .HasForeignKey(e => e.OriginalApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<User>(e => e.AddedByUser)
            .WithMany()
            .HasForeignKey(e => e.AddedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
