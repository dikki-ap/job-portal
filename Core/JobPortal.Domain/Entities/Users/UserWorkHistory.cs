using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Users;

public class UserWorkHistory : AuditableEntity
{
    public int UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? ResignationReason { get; set; }
    public int CurrencyTypeId { get; set; }
    public decimal Salary { get; set; }

    public User User { get; set; } = null!;
    public CurrencyType CurrencyType { get; set; } = null!;
}
