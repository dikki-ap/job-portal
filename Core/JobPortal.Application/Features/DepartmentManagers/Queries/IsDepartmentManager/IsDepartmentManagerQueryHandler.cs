using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.IsDepartmentManager;

public class IsDepartmentManagerQueryHandler(
    IDepartmentManagerRepository repository,
    ICurrentUserService currentUserService,
    ILogger<IsDepartmentManagerQueryHandler> logger)
    : IRequestHandler<IsDepartmentManagerQuery, IsDepartmentManagerDto>
{
    public async Task<IsDepartmentManagerDto> Handle(IsDepartmentManagerQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var email = currentUserService.GetCurrentUserEmail() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(email))
                return new IsDepartmentManagerDto(false, null, null);

            var manager = await repository.GetByEmailAsync(email, cancellationToken);
            if (manager is null)
                return new IsDepartmentManagerDto(false, null, null);

            return new IsDepartmentManagerDto(true, manager.DepartmentId, manager.Department?.Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking department manager status");
            throw;
        }
    }
}
