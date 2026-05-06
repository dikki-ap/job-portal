namespace JobPortal.Application.DTOs;

public record DepartmentManagerDto(
    int Id,
    string FullName,
    string Position,
    string Email,
    IReadOnlyList<int> DepartmentIds,
    IReadOnlyList<string> DepartmentNames,
    DateTime CreatedAt,
    int CreatedByUserId,
    string? CreatedByName,
    DateTime? UpdatedAt,
    int? UpdatedByUserId,
    string? UpdatedByName
);
