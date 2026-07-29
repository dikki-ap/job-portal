using JobPortal.Domain.Entities.Applications;
using JobPortal.Domain.Entities.Documents;

namespace JobPortal.Application.Interfaces.Repositories;

public interface IDocumentRepository
{
    Task<int> AddAsync(Document document, CancellationToken ct = default);
    Task<ApplicationDocument?> GetApplicationDocumentForDownloadAsync(int id, CancellationToken ct = default);
}
