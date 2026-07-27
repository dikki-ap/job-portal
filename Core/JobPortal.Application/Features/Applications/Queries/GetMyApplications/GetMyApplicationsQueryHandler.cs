using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Queries.GetMyApplications;

public class GetMyApplicationsQueryHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUserService,
    ILogger<GetMyApplicationsQueryHandler> logger)
    : IRequestHandler<GetMyApplicationsQuery, IEnumerable<ApplicationDto>>
{
    public async Task<IEnumerable<ApplicationDto>> Handle(GetMyApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        try
        {
            var items = await repository.GetByUserIdAsync(userId, cancellationToken);
            return items.Select(a => GetAllApplicationsQueryHandler.MapToDto(a, excludeCompanyDocuments: true));
        }
        catch (Exception ex) when (ex is not UnauthorizedAccessException)
        {
            logger.LogError(ex, "Error getting applications for userId={UserId}", userId);
            throw;
        }
    }
}
