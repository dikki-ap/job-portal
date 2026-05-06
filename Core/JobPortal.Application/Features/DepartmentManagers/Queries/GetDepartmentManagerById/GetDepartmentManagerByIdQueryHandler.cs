using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Queries.GetDepartmentManagerById;

public class GetDepartmentManagerByIdQueryHandler(
    IDepartmentManagerRepository repository,
    ILogger<GetDepartmentManagerByIdQueryHandler> logger)
    : IRequestHandler<GetDepartmentManagerByIdQuery, DepartmentManagerDto>
{
    public async Task<DepartmentManagerDto> Handle(GetDepartmentManagerByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var manager = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Department manager with ID {request.Id} not found.");

            return new DepartmentManagerDto(
                manager.Id,
                manager.FullName,
                manager.Position,
                manager.Email,
                manager.Departments.Select(d => d.DepartmentId).ToList(),
                manager.Departments.Select(d => d.Department?.Name ?? string.Empty).ToList(),
                manager.CreatedAt,
                manager.CreatedByUserId,
                manager.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                manager.UpdatedAt,
                manager.UpdatedByUserId,
                manager.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching department manager id={Id}", request.Id);
            throw;
        }
    }
}
