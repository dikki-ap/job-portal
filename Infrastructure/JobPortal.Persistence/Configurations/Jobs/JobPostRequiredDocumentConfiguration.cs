using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobPostRequiredDocumentConfiguration : IEntityTypeConfiguration<JobPostRequiredDocument>
{
    public void Configure(EntityTypeBuilder<JobPostRequiredDocument> builder)
    {
        builder.ToTable("JobPostRequiredDocuments");

        builder.HasIndex(d => new { d.JobPostId, d.DocumentTypeId }).IsUnique();

        builder.HasOne(d => d.JobPost)
            .WithMany(j => j.RequiredDocuments)
            .HasForeignKey(d => d.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.DocumentType)
            .WithMany()
            .HasForeignKey(d => d.DocumentTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
