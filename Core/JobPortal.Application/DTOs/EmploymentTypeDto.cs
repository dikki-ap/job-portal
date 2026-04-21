namespace JobPortal.Application.DTOs;

public record EmploymentTypeDto(
    int Id,
    string Name,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName
);
