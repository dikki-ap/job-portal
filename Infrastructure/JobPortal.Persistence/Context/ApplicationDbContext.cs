using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Audit;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Domain.Entities.TalentPool;
using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace JobPortal.Persistence.Context;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    // Masters
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<EducationLevel> EducationLevels => Set<EducationLevel>();
    public DbSet<EducationMajor> EducationMajors => Set<EducationMajor>();
    public DbSet<CurrencyType> CurrencyTypes => Set<CurrencyType>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<DocumentTypeMimeType> DocumentTypeMimeTypes => Set<DocumentTypeMimeType>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<DepartmentManager> DepartmentManagers => Set<DepartmentManager>();
    public DbSet<WorkMode> WorkModes => Set<WorkMode>();
    public DbSet<EmploymentType> EmploymentTypes => Set<EmploymentType>();
    public DbSet<JobCategory> JobCategories => Set<JobCategory>();
    public DbSet<JobLevel> JobLevels => Set<JobLevel>();

    // Users
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();
    public DbSet<UserEducationHistory> UserEducationHistories => Set<UserEducationHistory>();
    public DbSet<UserWorkHistory> UserWorkHistories => Set<UserWorkHistory>();
    public DbSet<UserOrganizationHistory> UserOrganizationHistories => Set<UserOrganizationHistory>();
    public DbSet<UserSkill> UserSkills => Set<UserSkill>();
    public DbSet<UserDocument> UserDocuments => Set<UserDocument>();

    // Documents
    public DbSet<Document> Documents => Set<Document>();

    // Jobs
    public DbSet<JobPost> JobPosts => Set<JobPost>();
    public DbSet<JobPostSkill> JobPostSkills => Set<JobPostSkill>();
    public DbSet<JobPostRequiredDocument> JobPostRequiredDocuments => Set<JobPostRequiredDocument>();
    public DbSet<JobPostEducationMajor> JobPostEducationMajors => Set<JobPostEducationMajor>();
    public DbSet<JobStep> JobSteps => Set<JobStep>();
    public DbSet<HiringTemplate> HiringTemplates => Set<HiringTemplate>();
    public DbSet<HiringTemplateStep> HiringTemplateSteps => Set<HiringTemplateStep>();
    public DbSet<ApprovalLevel> ApprovalLevels => Set<ApprovalLevel>();
    public DbSet<JobApprovalInstance> JobApprovalInstances => Set<JobApprovalInstance>();
    public DbSet<JobApprovalInstanceStep> JobApprovalInstanceSteps => Set<JobApprovalInstanceStep>();

    // Applications
    public DbSet<Domain.Entities.Applications.Application> Applications => Set<Domain.Entities.Applications.Application>();
    public DbSet<ApplicationDocument> ApplicationDocuments => Set<ApplicationDocument>();
    public DbSet<ApplicationStep> ApplicationSteps => Set<ApplicationStep>();

    // Talent Pool
    public DbSet<TalentPoolEntry> TalentPoolEntries => Set<TalentPoolEntry>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // MySQL stores DATETIME without timezone; mark all DateTime values read from DB as UTC
        // so System.Text.Json serializes them with 'Z' suffix and browsers parse them correctly.
        var utcConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        var utcNullableConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v : v.Value.ToUniversalTime()) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(utcConverter);
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(utcNullableConverter);
            }
        }

        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
            .Where(e => typeof(AuditableEntity).IsAssignableFrom(e.ClrType)
                     && e.ClrType != typeof(AuditableEntity)))
        {
            modelBuilder.Entity(entityType.ClrType)
                .HasOne(typeof(User), nameof(AuditableEntity.CreatedByUser))
                .WithMany()
                .HasForeignKey(nameof(AuditableEntity.CreatedByUserId))
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity(entityType.ClrType)
                .HasOne(typeof(User), nameof(AuditableEntity.UpdatedByUser))
                .WithMany()
                .HasForeignKey(nameof(AuditableEntity.UpdatedByUserId))
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
