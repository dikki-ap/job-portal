namespace JobPortal.Application.DTOs;

public record ApplicationAnalyticsDto(
    string Code,
    string? CandidateName,
    string AppliedAt,
    string UpdatedAt,
    string Status,
    string? Source,
    string JobPostTitle,
    string? JobPostDepartmentName,
    int? Rating,
    int? DmRating,
    IReadOnlyList<StepAnalyticsDto> Steps
);

public record StepAnalyticsDto(
    string StepName,
    int StepOrder,
    string Status
);
