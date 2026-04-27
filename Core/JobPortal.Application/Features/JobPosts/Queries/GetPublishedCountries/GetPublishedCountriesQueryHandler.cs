using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedCountries;

public class GetPublishedCountriesQueryHandler(
    IJobPostRepository repository,
    ILogger<GetPublishedCountriesQueryHandler> logger)
    : IRequestHandler<GetPublishedCountriesQuery, IEnumerable<string>>
{
    public async Task<IEnumerable<string>> Handle(GetPublishedCountriesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            return await repository.GetPublishedCountriesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting published countries");
            throw;
        }
    }
}
