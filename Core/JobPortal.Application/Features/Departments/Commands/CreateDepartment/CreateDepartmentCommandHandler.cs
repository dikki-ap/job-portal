using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Departments.Commands.CreateDepartment;

public class CreateDepartmentCommandHandler(
    IDepartmentRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<CreateDepartmentCommandHandler> logger)
    : IRequestHandler<CreateDepartmentCommand, DepartmentDto>
{
    public async Task<DepartmentDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var department = new Department
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(department, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.Departments);
            return new DepartmentDto(department.Id, department.Name, department.CreatedAt, department.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating department name={Name}", request.Name);
            throw;
        }
    }
}
