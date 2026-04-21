namespace JobPortal.Application.DTOs;

public record CurrencyTypeDto(
    int Id,
    string Name,
    string Prefix,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName);
