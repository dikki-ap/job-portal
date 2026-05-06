using JobPortal.Domain.Entities.Masters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Persistence.Configurations.Masters;

public class EducationLevelConfiguration : IEntityTypeConfiguration<EducationLevel>
{
    public void Configure(EntityTypeBuilder<EducationLevel> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
    }
}

public class EducationMajorConfiguration : IEntityTypeConfiguration<EducationMajor>
{
    public void Configure(EntityTypeBuilder<EducationMajor> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
    }
}

public class CurrencyTypeConfiguration : IEntityTypeConfiguration<CurrencyType>
{
    public void Configure(EntityTypeBuilder<CurrencyType> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Prefix).HasMaxLength(10).IsRequired();
    }
}

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
    }
}

public class DocumentTypeConfiguration : IEntityTypeConfiguration<DocumentType>
{
    public void Configure(EntityTypeBuilder<DocumentType> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.HasMany(d => d.MimeTypes)
            .WithOne(m => m.DocumentType)
            .HasForeignKey(m => m.DocumentTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DocumentTypeMimeTypeConfiguration : IEntityTypeConfiguration<DocumentTypeMimeType>
{
    public void Configure(EntityTypeBuilder<DocumentTypeMimeType> builder)
    {
        builder.ToTable("DocumentTypeMimeTypes");
        builder.Property(e => e.MimeType).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => new { e.DocumentTypeId, e.MimeType }).IsUnique();
    }
}

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
    }
}

public class WorkModeConfiguration : IEntityTypeConfiguration<WorkMode>
{
    public void Configure(EntityTypeBuilder<WorkMode> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
    }
}

public class EmploymentTypeConfiguration : IEntityTypeConfiguration<EmploymentType>
{
    public void Configure(EntityTypeBuilder<EmploymentType> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
    }
}

public class JobCategoryConfiguration : IEntityTypeConfiguration<JobCategory>
{
    public void Configure(EntityTypeBuilder<JobCategory> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
    }
}

public class JobLevelConfiguration : IEntityTypeConfiguration<JobLevel>
{
    public void Configure(EntityTypeBuilder<JobLevel> builder)
    {
        builder.HasIndex(e => e.Name).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
    }
}

public class DepartmentManagerConfiguration : IEntityTypeConfiguration<DepartmentManager>
{
    public void Configure(EntityTypeBuilder<DepartmentManager> builder)
    {
        builder.Property(e => e.FullName).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Position).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Email).HasMaxLength(255).IsRequired();

        builder.HasIndex(e => e.Email).IsUnique();

        builder.HasMany(e => e.Departments)
            .WithOne(d => d.DepartmentManager)
            .HasForeignKey(d => d.DepartmentManagerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DepartmentManagerDepartmentConfiguration : IEntityTypeConfiguration<DepartmentManagerDepartment>
{
    public void Configure(EntityTypeBuilder<DepartmentManagerDepartment> builder)
    {
        builder.ToTable("DepartmentManagerDepartments");
        builder.HasKey(d => new { d.DepartmentManagerId, d.DepartmentId });

        builder.HasOne(d => d.Department)
            .WithMany()
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
