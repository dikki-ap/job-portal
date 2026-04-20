using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Users;

public class UserAddress : AuditableEntity
{
    public int UserId { get; set; }
    public string DomicileAddress { get; set; } = string.Empty;
    public string DomicileProvince { get; set; } = string.Empty;
    public string DomicileCity { get; set; } = string.Empty;
    public string DomicileDistrict { get; set; } = string.Empty;
    public string DomicileVillage { get; set; } = string.Empty;
    public string DomicilePostalCode { get; set; } = string.Empty;
    public string IDAddress { get; set; } = string.Empty;
    public string IDProvince { get; set; } = string.Empty;
    public string IDCity { get; set; } = string.Empty;
    public string IDDistrict { get; set; } = string.Empty;
    public string IDVillage { get; set; } = string.Empty;
    public string IDPostalCode { get; set; } = string.Empty;

    public User User { get; set; } = null!;
}
