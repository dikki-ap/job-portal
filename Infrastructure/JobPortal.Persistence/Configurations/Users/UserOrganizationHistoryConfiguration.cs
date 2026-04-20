using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserOrganizationHistoryConfiguration : IEntityTypeConfiguration<UserOrganizationHistory>
{
    public void Configure(EntityTypeBuilder<UserOrganizationHistory> builder)
    {
        builder.Property(o => o.OrganizationName).HasMaxLength(255).IsRequired();
        builder.Property(o => o.OrganizationType).HasMaxLength(100).IsRequired();
        builder.Property(o => o.Position).HasMaxLength(150).IsRequired();
    }
}
