using JobPortal.Domain.Entities.Masters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Masters;

public class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Key).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Value).HasColumnType("longtext").IsRequired();
        builder.HasIndex(a => a.Key).IsUnique();
    }
}
