namespace JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;

public record CreateJobStepRequest(string Name, bool IsRequired);

public record CreateRequiredDocumentRequest(int DocumentTypeId, bool IsRequired);
