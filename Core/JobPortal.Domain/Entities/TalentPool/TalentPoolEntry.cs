using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Users;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Domain.Entities.TalentPool;

public class TalentPoolEntry : BaseEntity
{
    public int UserId { get; set; }
    public int OriginalApplicationId { get; set; }
    public string? Notes { get; set; }
    public int AddedByUserId { get; set; }
    public DateTime AddedAt { get; set; }

    public User User { get; set; } = null!;
    public ApplicationEntity OriginalApplication { get; set; } = null!;
    public User AddedByUser { get; set; } = null!;
}
