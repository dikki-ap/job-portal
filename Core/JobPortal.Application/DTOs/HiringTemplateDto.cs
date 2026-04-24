namespace JobPortal.Application.DTOs;

public record HiringTemplateStepDto(
    int Id,
    string Name,
    int StepOrder,
    bool IsRequired,
    string? PassEmailSubject,
    string? PassEmailBody,
    string? FailEmailSubject,
    string? FailEmailBody);

public record HiringTemplateDto(
    int Id,
    string Name,
    string? Description,
    IEnumerable<HiringTemplateStepDto> Steps,
    DateTime CreatedAt,
    string? CreatedByName,
    DateTime? UpdatedAt,
    string? UpdatedByName);
