using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Jobs;

public class JobPost : SoftDeletableEntity
{
    public int DepartmentId { get; set; }
    public int WorkModeId { get; set; }
    public int EmploymentTypeId { get; set; }
    public int JobCategoryId { get; set; }
    public int JobLevelId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? MinEducationLevelId { get; set; }
    public int MinExperienceYears { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public bool IsSalaryVisible { get; set; }
    public int? CurrencyTypeId { get; set; }
    public int Quota { get; set; } = 1;
    public DateTime? PublishDate { get; set; }
    public DateTime? CloseDate { get; set; }
    public string Status { get; set; } = string.Empty;

    public Department Department { get; set; } = null!;
    public WorkMode WorkMode { get; set; } = null!;
    public EmploymentType EmploymentType { get; set; } = null!;
    public JobCategory JobCategory { get; set; } = null!;
    public JobLevel JobLevel { get; set; } = null!;
    public EducationLevel? MinEducationLevel { get; set; }
    public CurrencyType? CurrencyType { get; set; }
    public ICollection<JobStep> JobSteps { get; set; } = [];
    public ICollection<JobPostSkill> RequiredSkills { get; set; } = [];
    public ICollection<JobPostRequiredDocument> RequiredDocuments { get; set; } = [];
    public ICollection<JobApprovalInstance> ApprovalInstances { get; set; } = [];
    public ICollection<Application> Applications { get; set; } = [];
}
