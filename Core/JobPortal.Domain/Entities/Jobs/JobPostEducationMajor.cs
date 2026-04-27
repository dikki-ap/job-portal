using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Domain.Entities.Jobs;

public class JobPostEducationMajor
{
    public int Id { get; set; }
    public int JobPostId { get; set; }
    public int EducationMajorId { get; set; }

    public JobPost JobPost { get; set; } = null!;
    public EducationMajor EducationMajor { get; set; } = null!;
}
