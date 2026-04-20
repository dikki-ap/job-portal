using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities.Masters;

public class CurrencyType : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Prefix { get; set; } = string.Empty;
}
