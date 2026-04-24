namespace JobPortal.Application.DTOs;

public record ApprovalLevelDto(
    int Id,
    string Name,
    int LevelOrder,
    string ApproverName,
    string ApproverEmail,
    bool IsActive,
    DateTime CreatedAt,
    string? CreatedByName);

public record PendingApprovalDto(
    int JobPostId,
    string JobTitle,
    string Department,
    int CurrentStepOrder,
    int TotalSteps,
    DateTime SubmittedAt);

public record ApprovalStepStatusDto(
    int StepOrder,
    string ApproverName,
    string ApproverEmail,
    string Status,
    string? Comment,
    DateTime? ActionAt);

public record ApprovalStatusDto(
    string InstanceStatus,
    DateTime StartedAt,
    DateTime? CompletedAt,
    IEnumerable<ApprovalStepStatusDto> Steps);
