namespace JobPortal.Application.DTOs;

public record DocumentTypeDto(
    int Id,
    string Name,
    int MaxFileSizeMb,
    bool IsDefaultRequired,
    IEnumerable<string> AllowedMimeTypes,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName);
