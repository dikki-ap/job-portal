using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Masters;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class DocumentTypeRepository(ApplicationDbContext context) : IDocumentTypeRepository
{
    public async Task<IEnumerable<DocumentType>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.DocumentTypes
            .Include(d => d.MimeTypes)
            .Include(d => d.CreatedByUser)
            .Include(d => d.UpdatedByUser)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);

    public async Task<DocumentType?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.DocumentTypes
            .Include(d => d.MimeTypes)
            .Include(d => d.CreatedByUser)
            .Include(d => d.UpdatedByUser)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.DocumentTypes.AnyAsync(
            d => d.Name == name && (excludeId == null || d.Id != excludeId),
            cancellationToken);

    public async Task AddAsync(DocumentType documentType, CancellationToken cancellationToken = default)
        => await context.DocumentTypes.AddAsync(documentType, cancellationToken);

    public Task UpdateAsync(DocumentType documentType, CancellationToken cancellationToken = default)
    {
        context.DocumentTypes.Update(documentType);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DocumentType documentType, CancellationToken cancellationToken = default)
    {
        context.DocumentTypes.Remove(documentType);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
