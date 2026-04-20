using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Users;

public class UserEducationHistory : AuditableEntity
{
    public int UserId { get; set; }
    public int EducationLevelId { get; set; }
    public int EducationMajorId { get; set; }
    public string InstitutionName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public float? Grade { get; set; }
    public string? CertificateNumber { get; set; }

    public User User { get; set; } = null!;
    public EducationLevel EducationLevel { get; set; } = null!;
    public EducationMajor EducationMajor { get; set; } = null!;
}
