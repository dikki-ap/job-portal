namespace JobPortal.Application.DTOs;

public record DepartmentManagerDto(
    int Id,
    string FullName,
    string Position,
    string Email,
    int DepartmentId,
    string DepartmentName,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName
);
