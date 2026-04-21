using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Departments.Commands.UpdateDepartment;

public class UpdateDepartmentCommandHandler(
    IDepartmentRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateDepartmentCommandHandler> logger)
    : IRequestHandler<UpdateDepartmentCommand, DepartmentDto>
{
    public async Task<DepartmentDto> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var department = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Department with ID {request.Id} not found.");

            department.Name = request.Name;
            department.UpdatedAt = DateTime.UtcNow;
            department.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(department, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            var updatedByName = department.UpdatedByUser is { } u
                ? $"{u.FirstName} {u.LastName}".Trim()
                : null;

            return new DepartmentDto(
                department.Id,
                department.Name,
                department.CreatedAt,
                department.CreatedByUserId,
                department.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                department.UpdatedAt,
                department.UpdatedByUserId,
                updatedByName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating department id={Id}", request.Id);
            throw;
        }
    }
}
