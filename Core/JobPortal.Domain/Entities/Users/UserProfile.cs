using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Users;

public class UserProfile : AuditableEntity
{
    public int UserId { get; set; }
    public string NIK { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int? EducationLevelId { get; set; }
    public int? CvDocumentId { get; set; }
    public int? CvDocumentTypeId { get; set; }

    public User User { get; set; } = null!;
    public EducationLevel? EducationLevel { get; set; }
    public Document? CvDocument { get; set; }
}
