namespace JobPortal.Application.DTOs;

public record EducationLevelDto(
    int Id,
    string Name,
    int Level,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName);
