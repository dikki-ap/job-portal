using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;

namespace JobPortal.Persistence.Repositories;

public class ApplicationDocumentRepository(ApplicationDbContext context) : IApplicationDocumentRepository
{
    public async Task<ApplicationDocument> AddCompanyDocumentAsync(
        int applicationId,
        string storageKey,
        string originalFileName,
        string contentType,
        int createdByUserId,
        string documentType,
        CancellationToken ct = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(ct);
        try
        {
            var doc = new Document
            {
                FilePath = storageKey,
                OriginalFileName = originalFileName,
                FileType = contentType,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId,
            };
            context.Documents.Add(doc);
            await context.SaveChangesAsync(ct);

            var appDoc = new ApplicationDocument
            {
                ApplicationId = applicationId,
                DocumentId = doc.Id,
                DocumentType = documentType,
                IsCompanyDocument = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId,
            };
            context.ApplicationDocuments.Add(appDoc);
            await context.SaveChangesAsync(ct);

            await tx.CommitAsync(ct);
            return appDoc;
        }
        catch
        {
            await tx.RollbackAsync(CancellationToken.None);
            throw;
        }
    }
}
