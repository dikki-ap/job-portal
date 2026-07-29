using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Documents;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class DocumentRepository(ApplicationDbContext context) : IDocumentRepository
{
    public async Task<int> AddAsync(Document document, CancellationToken ct = default)
    {
        context.Documents.Add(document);
        await context.SaveChangesAsync(ct);
        return document.Id;
    }

    public Task<ApplicationDocument?> GetApplicationDocumentForDownloadAsync(int id, CancellationToken ct = default)
        => context.ApplicationDocuments
            .Include(ad => ad.Document)
            .Include(ad => ad.Application)
                .ThenInclude(a => a.JobPost)
            .FirstOrDefaultAsync(ad => ad.Id == id, ct);
}
