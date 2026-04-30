using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedCountries;

public class GetPublishedCountriesQueryHandler(
    IJobPostRepository repository,
    IMemoryCache cache,
    ILogger<GetPublishedCountriesQueryHandler> logger)
    : IRequestHandler<GetPublishedCountriesQuery, IEnumerable<string>>
{
    public async Task<IEnumerable<string>> Handle(GetPublishedCountriesQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.PublishedCountries, out IEnumerable<string>? cached) && cached is not null)
            return cached;

        try
        {
            var result = await repository.GetPublishedCountriesAsync(cancellationToken);
            cache.Set(CacheKeys.PublishedCountries, result, TimeSpan.FromDays(1));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting published countries");
            throw;
        }
    }
}
