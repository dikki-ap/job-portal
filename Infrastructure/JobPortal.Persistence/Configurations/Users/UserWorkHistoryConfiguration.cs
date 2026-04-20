using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserWorkHistoryConfiguration : IEntityTypeConfiguration<UserWorkHistory>
{
    public void Configure(EntityTypeBuilder<UserWorkHistory> builder)
    {
        builder.Property(w => w.CompanyName).HasMaxLength(255).IsRequired();
        builder.Property(w => w.BusinessType).HasMaxLength(150).IsRequired();
        builder.Property(w => w.Position).HasMaxLength(150).IsRequired();
        builder.Property(w => w.ResignationReason).HasMaxLength(500);
        builder.Property(w => w.Salary).HasPrecision(18, 2);

        builder.HasOne(w => w.CurrencyType)
            .WithMany()
            .HasForeignKey(w => w.CurrencyTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
