namespace JobPortal.Application.DTOs;

public record ApplicationStepItemDto(
    int Id,
    int JobStepId,
    string StepName,
    int StepOrder,
    bool IsRequired,
    string Status,
    DateTime? CompletedAt);

public record ApplicationDocumentDto(
    int Id,
    string DocumentType,
    string OriginalFileName,
    string FilePath,
    string FileType,
    DateTime CreatedAt);

public record ApplicationDto(
    int Id,
    string Code,
    int JobPostId,
    string JobPostTitle,
    int UserId,
    string CandidateName,
    string CandidateEmail,
    string? CandidatePhone,
    string Status,
    DateTime AppliedAt,
    DateTime UpdatedAt,
    IEnumerable<ApplicationStepItemDto> Steps,
    IEnumerable<ApplicationDocumentDto> Documents,
    int? Rating,
    string? RatingNote,
    DateTime? RatedAt);
