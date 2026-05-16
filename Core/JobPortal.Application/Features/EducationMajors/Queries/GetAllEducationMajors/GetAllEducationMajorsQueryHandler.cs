using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Queries.GetAllEducationMajors;

public class GetAllEducationMajorsQueryHandler(
    IEducationMajorRepository repository,
    IMemoryCache cache,
    ILogger<GetAllEducationMajorsQueryHandler> logger)
    : IRequestHandler<GetAllEducationMajorsQuery, IEnumerable<EducationMajorDto>>
{
    public async Task<IEnumerable<EducationMajorDto>> Handle(GetAllEducationMajorsQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.EducationMajors, out IEnumerable<EducationMajorDto>? cached) && cached is not null)
            return cached;

        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            var result = items.Select(m => new EducationMajorDto(
                m.Id, m.Name, m.CreatedAt, m.CreatedByUserId,
                m.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                m.UpdatedAt, m.UpdatedByUserId,
                m.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.EducationMajors, (IEnumerable<EducationMajorDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all education majors");
            throw;
        }
    }
}
