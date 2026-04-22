namespace JobPortal.Domain.Entities.Jobs;

public class HiringTemplateStep
{
    public int Id { get; set; }
    public int HiringTemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsRequired { get; set; } = true;

    public HiringTemplate HiringTemplate { get; set; } = null!;
}
