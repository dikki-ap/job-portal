using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Queries.GetApplicationByCode;

public class GetApplicationByCodeQueryHandler(
    IApplicationRepository repository,
    ILogger<GetApplicationByCodeQueryHandler> logger)
    : IRequestHandler<GetApplicationByCodeQuery, ApplicationDto?>
{
    public async Task<ApplicationDto?> Handle(GetApplicationByCodeQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var application = await repository.GetByCodeAsync(request.Code, cancellationToken);
            return application is null
                ? null
                : GetAllApplicationsQueryHandler.MapToDto(application, request.ExcludeCompanyDocuments);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting application code={Code}", request.Code);
            throw;
        }
    }
}
