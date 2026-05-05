namespace JobPortal.Application.DTOs;

public record IsDepartmentManagerDto(
    bool IsDepartmentManager,
    int? DepartmentId,
    string? DepartmentName
);
