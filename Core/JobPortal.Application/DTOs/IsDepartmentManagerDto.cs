namespace JobPortal.Application.DTOs;

public record IsDepartmentManagerDto(
    bool IsDepartmentManager,
    IReadOnlyList<int> DepartmentIds,
    IReadOnlyList<string> DepartmentNames
);
