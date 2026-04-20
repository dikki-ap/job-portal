using JobPortal.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Audit;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.Property(a => a.TableName).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Action).HasMaxLength(50).IsRequired();
        builder.Property(a => a.OldValue).HasColumnType("longtext");
        builder.Property(a => a.NewValue).HasColumnType("longtext");

        builder.HasOne(a => a.ChangedBy)
            .WithMany()
            .HasForeignKey(a => a.ChangedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.TableName, a.RecordId });
    }
}
