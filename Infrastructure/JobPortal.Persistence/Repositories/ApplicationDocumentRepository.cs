using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class ApplicationDocumentRepository(ApplicationDbContext context) : IApplicationDocumentRepository
{
    public async Task<ApplicationDocument?> GetCompanyDocumentAsync(int appDocId, CancellationToken ct = default)
        => await context.ApplicationDocuments
            .Include(d => d.Document)
            .FirstOrDefaultAsync(d => d.Id == appDocId && d.IsCompanyDocument, ct);

    public async Task DeleteCompanyDocumentAsync(ApplicationDocument appDoc, CancellationToken ct = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(ct);
        try
        {
            context.ApplicationDocuments.Remove(appDoc);
            await context.SaveChangesAsync(ct);
            context.Documents.Remove(appDoc.Document);
            await context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch
        {
            await tx.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);

    public async Task ReplaceCompanyDocumentFileAsync(
        ApplicationDocument appDoc,
        string newStorageKey,
        string newOriginalFileName,
        string newContentType,
        CancellationToken ct = default)
    {
        appDoc.Document.FilePath = newStorageKey;
        appDoc.Document.OriginalFileName = newOriginalFileName;
        appDoc.Document.FileType = newContentType;
        await context.SaveChangesAsync(ct);
    }

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
