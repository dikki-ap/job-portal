using JobPortal.Domain.Common;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Domain.Entities.Users;

namespace JobPortal.Domain.Entities.Applications;

public class Application : BaseEntity
{
    public int JobPostId { get; set; }
    public int UserId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int? DeletedByUserId { get; set; }
    public DateTime UpdatedAt { get; set; }

    public int? Rating { get; set; }
    public string? RatingNote { get; set; }
    public DateTime? RatedAt { get; set; }
    public int? RatedByUserId { get; set; }

    public int? DmRating { get; set; }
    public string? DmRatingNote { get; set; }
    public DateTime? DmRatedAt { get; set; }
    public int? DmRatedByUserId { get; set; }

    public string? Source { get; set; }

    public JobPost JobPost { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<ApplicationDocument> Documents { get; set; } = [];
    public ICollection<ApplicationStep> Steps { get; set; } = [];
}
