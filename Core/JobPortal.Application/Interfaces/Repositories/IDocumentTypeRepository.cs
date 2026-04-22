using JobPortal.Domain.Entities.Masters;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IDocumentTypeRepository
{
    Task<IEnumerable<DocumentType>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<(int Id, string Name)>> GetGloballyRequiredAsync(CancellationToken cancellationToken = default);
    Task<DocumentType?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(DocumentType documentType, CancellationToken cancellationToken = default);
    Task UpdateAsync(DocumentType documentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(DocumentType documentType, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
