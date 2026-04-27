using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedCountries;

public record GetPublishedCountriesQuery : IRequest<IEnumerable<string>>;
