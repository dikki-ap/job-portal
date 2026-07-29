using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.Analytics.Queries.GetApplicationsForAnalytics;

public class GetApplicationsForAnalyticsQueryHandler(IApplicationRepository repository)
    : IRequestHandler<GetApplicationsForAnalyticsQuery, IEnumerable<ApplicationAnalyticsDto>>
{
    public Task<IEnumerable<ApplicationAnalyticsDto>> Handle(
        GetApplicationsForAnalyticsQuery request, CancellationToken ct)
        => repository.GetForAnalyticsAsync(ct);
}
