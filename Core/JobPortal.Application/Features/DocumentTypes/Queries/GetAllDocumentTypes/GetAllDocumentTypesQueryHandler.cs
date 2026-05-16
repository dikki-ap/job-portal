using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DocumentTypes.Queries.GetAllDocumentTypes;

public class GetAllDocumentTypesQueryHandler(
    IDocumentTypeRepository repository,
    IMemoryCache cache,
    ILogger<GetAllDocumentTypesQueryHandler> logger)
    : IRequestHandler<GetAllDocumentTypesQuery, IEnumerable<DocumentTypeDto>>
{
    public async Task<IEnumerable<DocumentTypeDto>> Handle(GetAllDocumentTypesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.DocumentTypes, out IEnumerable<DocumentTypeDto>? cached) && cached is not null)
            return cached;

        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            var result = items.Select(d => new DocumentTypeDto(
                d.Id, d.Name, d.MaxFileSizeMb,
                d.IsDefaultRequired,
                d.MimeTypes.Select(m => m.MimeType),
                d.CreatedAt, d.CreatedByUserId,
                d.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                d.UpdatedAt, d.UpdatedByUserId,
                d.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.DocumentTypes, (IEnumerable<DocumentTypeDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all document types");
            throw;
        }
    }
}
