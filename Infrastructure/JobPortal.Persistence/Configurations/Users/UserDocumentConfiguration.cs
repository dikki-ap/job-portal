using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Users;

public class UserDocumentConfiguration : IEntityTypeConfiguration<UserDocument>
{
    public void Configure(EntityTypeBuilder<UserDocument> builder)
    {
        builder.Property(d => d.DocumentNumber).HasMaxLength(100);

        builder.HasOne(d => d.DocumentType)
            .WithMany()
            .HasForeignKey(d => d.DocumentTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Document)
            .WithMany()
            .HasForeignKey(d => d.DocumentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
