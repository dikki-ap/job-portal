using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
{
    public void Configure(EntityTypeBuilder<UserAddress> builder)
    {
        builder.Property(a => a.DomicileAddress).HasMaxLength(500).IsRequired();
        builder.Property(a => a.DomicileProvince).HasMaxLength(100).IsRequired();
        builder.Property(a => a.DomicileCity).HasMaxLength(100).IsRequired();
        builder.Property(a => a.DomicileDistrict).HasMaxLength(100).IsRequired();
        builder.Property(a => a.DomicileVillage).HasMaxLength(100).IsRequired();
        builder.Property(a => a.DomicilePostalCode).HasMaxLength(10).IsRequired();

        builder.Property(a => a.IDAddress).HasMaxLength(500).IsRequired();
        builder.Property(a => a.IDProvince).HasMaxLength(100).IsRequired();
        builder.Property(a => a.IDCity).HasMaxLength(100).IsRequired();
        builder.Property(a => a.IDDistrict).HasMaxLength(100).IsRequired();
        builder.Property(a => a.IDVillage).HasMaxLength(100).IsRequired();
        builder.Property(a => a.IDPostalCode).HasMaxLength(10).IsRequired();
    }
}
