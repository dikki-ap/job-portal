using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
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
            manager.DepartmentId = request.DepartmentId;
            manager.UpdatedAt = DateTime.UtcNow;
            manager.UpdatedByUserId = currentUserService.GetCurrentUserId();

            await repository.UpdateAsync(manager, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new DepartmentManagerDto(
                manager.Id,
                manager.FullName,
                manager.Position,
                manager.Email,
                manager.DepartmentId,
                manager.Department?.Name ?? string.Empty,
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
