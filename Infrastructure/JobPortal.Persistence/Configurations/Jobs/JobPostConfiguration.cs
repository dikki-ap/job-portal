using JobPortal.Domain.Entities.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Jobs;

public class JobPostConfiguration : IEntityTypeConfiguration<JobPost>
{
    public void Configure(EntityTypeBuilder<JobPost> builder)
    {
        builder.HasQueryFilter(j => !j.IsDeleted);

        builder.HasIndex(j => j.Slug).IsUnique();

        builder.Property(j => j.Slug).HasMaxLength(255).IsRequired();
        builder.Property(j => j.Title).HasMaxLength(255).IsRequired();
        builder.Property(j => j.Description).HasColumnType("longtext").IsRequired();
        builder.Property(j => j.Location).HasMaxLength(255).IsRequired();
        builder.Property(j => j.Status).HasMaxLength(50).IsRequired();
        builder.Property(j => j.MinSalary).HasPrecision(18, 2);
        builder.Property(j => j.MaxSalary).HasPrecision(18, 2);

        builder.HasOne(j => j.Department)
            .WithMany()
            .HasForeignKey(j => j.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.WorkMode)
            .WithMany()
            .HasForeignKey(j => j.WorkModeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.EmploymentType)
            .WithMany()
            .HasForeignKey(j => j.EmploymentTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.JobCategory)
            .WithMany()
            .HasForeignKey(j => j.JobCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.JobLevel)
            .WithMany()
            .HasForeignKey(j => j.JobLevelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.MinEducationLevel)
            .WithMany()
            .HasForeignKey(j => j.MinEducationLevelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.CurrencyType)
            .WithMany()
            .HasForeignKey(j => j.CurrencyTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(j => j.JobSteps)
            .WithOne(s => s.JobPost)
            .HasForeignKey(s => s.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(j => j.RequiredSkills)
            .WithOne(s => s.JobPost)
            .HasForeignKey(s => s.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(j => j.RequiredDocuments)
            .WithOne(d => d.JobPost)
            .HasForeignKey(d => d.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(j => j.ApprovalInstances)
            .WithOne(a => a.JobPost)
            .HasForeignKey(a => a.JobPostId);

        builder.HasMany(j => j.Applications)
            .WithOne(a => a.JobPost)
            .HasForeignKey(a => a.JobPostId);
    }
}
