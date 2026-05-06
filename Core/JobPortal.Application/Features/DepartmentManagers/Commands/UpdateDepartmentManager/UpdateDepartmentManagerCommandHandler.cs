using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.UpdateDepartmentManager;

public class UpdateDepartmentManagerCommandHandler(
    IDepartmentManagerRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateDepartmentManagerCommandHandler> logger)
    : IRequestHandler<UpdateDepartmentManagerCommand, DepartmentManagerDto>
{
    public async Task<DepartmentManagerDto> Handle(UpdateDepartmentManagerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var manager = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Department manager with ID {request.Id} not found.");

            manager.FullName = request.FullName;
            manager.Position = request.Position;
            manager.Email = request.Email.Trim().ToLowerInvariant();
            manager.UpdatedAt = DateTime.UtcNow;
            manager.UpdatedByUserId = currentUserService.GetCurrentUserId();

            manager.Departments.Clear();
            foreach (var deptId in request.DepartmentIds)
                manager.Departments.Add(new DepartmentManagerDepartment { DepartmentId = deptId });

            await repository.UpdateAsync(manager, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            var deptIds = manager.Departments.Select(d => d.DepartmentId).ToList();
            var deptNames = manager.Departments.Select(d => d.Department?.Name ?? string.Empty).ToList();

            return new DepartmentManagerDto(
                manager.Id,
                manager.FullName,
                manager.Position,
                manager.Email,
                deptIds,
                deptNames,
                manager.CreatedAt,
                manager.CreatedByUserId,
                manager.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                manager.UpdatedAt,
                manager.UpdatedByUserId,
                manager.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating department manager id={Id}", request.Id);
            throw;
        }
    }
}
