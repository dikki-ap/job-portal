namespace JobPortal.Domain.Entities.Jobs;

public class HiringTemplateStep
{
    public int Id { get; set; }
    public int HiringTemplateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? PassEmailSubject { get; set; }
    public string? PassEmailBody { get; set; }
    public string? FailEmailSubject { get; set; }
    public string? FailEmailBody { get; set; }

    public HiringTemplate HiringTemplate { get; set; } = null!;
}
