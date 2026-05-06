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
                return new IsDepartmentManagerDto(false, [], []);

            var manager = await repository.GetByEmailAsync(email, cancellationToken);
            if (manager is null)
                return new IsDepartmentManagerDto(false, [], []);

            var deptIds = manager.Departments.Select(d => d.DepartmentId).ToList();
            var deptNames = manager.Departments.Select(d => d.Department?.Name ?? string.Empty).ToList();
            return new IsDepartmentManagerDto(true, deptIds, deptNames);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking department manager status");
            throw;
        }
    }
}
