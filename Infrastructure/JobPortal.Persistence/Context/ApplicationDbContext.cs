using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Audit;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Context;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    // Masters
    public DbSet<EducationLevel> EducationLevels => Set<EducationLevel>();
    public DbSet<EducationMajor> EducationMajors => Set<EducationMajor>();
    public DbSet<CurrencyType> CurrencyTypes => Set<CurrencyType>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<Department> Departments => Set<Department>();
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
    public DbSet<JobStep> JobSteps => Set<JobStep>();
    public DbSet<JobApprovalInstance> JobApprovalInstances => Set<JobApprovalInstance>();
    public DbSet<JobApprovalInstanceStep> JobApprovalInstanceSteps => Set<JobApprovalInstanceStep>();

    // Applications
    public DbSet<Domain.Entities.Applications.Application> Applications => Set<Domain.Entities.Applications.Application>();
    public DbSet<ApplicationDocument> ApplicationDocuments => Set<ApplicationDocument>();
    public DbSet<ApplicationStep> ApplicationSteps => Set<ApplicationStep>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
