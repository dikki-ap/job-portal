using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Analytics.Queries.GetApplicationsForAnalytics;

public record GetApplicationsForAnalyticsQuery : IRequest<IEnumerable<ApplicationAnalyticsDto>>;
