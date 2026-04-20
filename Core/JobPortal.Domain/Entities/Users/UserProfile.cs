using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Users;

public class UserProfile : AuditableEntity
{
    public int UserId { get; set; }
    public string? ProfilePicture { get; set; }
    public string NIK { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string BirthPlace { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string MaritalStatus { get; set; } = string.Empty;

    public User User { get; set; } = null!;
}
