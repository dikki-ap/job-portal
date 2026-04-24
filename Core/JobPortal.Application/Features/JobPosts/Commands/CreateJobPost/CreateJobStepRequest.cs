namespace JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;

public record CreateJobStepRequest(
    string Name,
    bool IsRequired,
    string? PassEmailSubject,
    string? PassEmailBody,
    string? FailEmailSubject,
    string? FailEmailBody);

public record CreateRequiredDocumentRequest(int DocumentTypeId, bool IsRequired);
