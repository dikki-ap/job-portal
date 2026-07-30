using JobPortal.Domain.Entities.Applications;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IApplicationDocumentRepository
{
    Task<ApplicationDocument> AddCompanyDocumentAsync(
        int applicationId,
        string storageKey,
        string originalFileName,
        string contentType,
        int createdByUserId,
        string documentType,
        CancellationToken ct = default);
}
