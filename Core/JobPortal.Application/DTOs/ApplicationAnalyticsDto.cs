namespace JobPortal.Application.DTOs;

public record ApplicationAnalyticsDto(
    string AppliedAt,
    string UpdatedAt,
    string Status,
    string? Source,
    string JobPostTitle,
    IReadOnlyList<StepAnalyticsDto> Steps
);

public record StepAnalyticsDto(
    string StepName,
    int StepOrder,
    string Status
);
