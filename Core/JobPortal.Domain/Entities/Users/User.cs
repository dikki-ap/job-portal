using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Domain.Entities.Users;

public class User : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public UserProfile? Profile { get; set; }
    public ICollection<UserAddress> Addresses { get; set; } = [];
    public ICollection<UserEducationHistory> EducationHistories { get; set; } = [];
    public ICollection<UserWorkHistory> WorkHistories { get; set; } = [];
    public ICollection<UserOrganizationHistory> OrganizationHistories { get; set; } = [];
    public ICollection<UserSkill> Skills { get; set; } = [];
    public ICollection<UserDocument> Documents { get; set; } = [];
    public ICollection<Application> Applications { get; set; } = [];
}
