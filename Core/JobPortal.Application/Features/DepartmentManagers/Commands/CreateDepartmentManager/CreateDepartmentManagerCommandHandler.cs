using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.CreateDepartmentManager;

public class CreateDepartmentManagerCommandHandler(
    IDepartmentManagerRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateDepartmentManagerCommandHandler> logger)
    : IRequestHandler<CreateDepartmentManagerCommand, DepartmentManagerDto>
{
    public async Task<DepartmentManagerDto> Handle(CreateDepartmentManagerCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var manager = new DepartmentManager
            {
                FullName = request.FullName,
                Position = request.Position,
                Email = request.Email.Trim().ToLowerInvariant(),
                DepartmentId = request.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(manager, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new DepartmentManagerDto(
                manager.Id,
                manager.FullName,
                manager.Position,
                manager.Email,
                manager.DepartmentId,
                string.Empty,
                manager.CreatedAt,
                manager.CreatedByUserId,
                null,
                null,
                null,
                null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating department manager email={Email}", request.Email);
            throw;
        }
    }
}
