namespace JobPortal.Application.DTOs;

public record JobCategoryDto(
    int Id,
    string Name,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName
);
