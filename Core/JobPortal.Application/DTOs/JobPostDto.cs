namespace JobPortal.Application.DTOs;

public record JobStepDto(
    int Id,
    string Name,
    int StepOrder,
    bool IsRequired,
    string? PassEmailSubject,
    string? PassEmailBody,
    string? FailEmailSubject,
    string? FailEmailBody);

public record JobSkillDto(int Id, string Name);

public record JobMajorDto(int Id, string Name);

public record JobRequiredDocumentDto(int DocumentTypeId, string DocumentTypeName, bool IsRequired);

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public record JobPostDto(
    int Id,
    string Title,
    string Slug,
    string Status,
    string City,
    string Country,
    string Description,
    int DepartmentId,
    string DepartmentName,
    int JobCategoryId,
    string JobCategoryName,
    int JobLevelId,
    string JobLevelName,
    int EmploymentTypeId,
    string EmploymentTypeName,
    int WorkModeId,
    string WorkModeName,
    int? MinEducationLevelId,
    string? MinEducationLevelName,
    int MinExperienceYears,
    decimal? MinSalary,
    decimal? MaxSalary,
    bool IsSalaryVisible,
    int? CurrencyTypeId,
    string? CurrencyTypePrefix,
    int Quota,
    DateTime? PublishDate,
    DateTime? CloseDate,
    IEnumerable<JobStepDto> Steps,
    IEnumerable<JobSkillDto> RequiredSkills,
    IEnumerable<JobRequiredDocumentDto> RequiredDocuments,
    IEnumerable<JobMajorDto> PreferredMajors,
    DateTime CreatedAt,
    string? CreatedByName);
