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

    Task<ApplicationDocument?> GetCompanyDocumentAsync(int appDocId, CancellationToken ct = default);

    Task DeleteCompanyDocumentAsync(ApplicationDocument appDoc, CancellationToken ct = default);

    Task ReplaceCompanyDocumentFileAsync(
        ApplicationDocument appDoc,
        string newStorageKey,
        string newOriginalFileName,
        string newContentType,
        CancellationToken ct = default);
}
