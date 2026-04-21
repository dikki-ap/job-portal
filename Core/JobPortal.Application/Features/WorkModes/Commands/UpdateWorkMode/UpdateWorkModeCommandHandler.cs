using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Commands.UpdateWorkMode;

public class UpdateWorkModeCommandHandler(
    IWorkModeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateWorkModeCommandHandler> logger)
    : IRequestHandler<UpdateWorkModeCommand, WorkModeDto>
{
    public async Task<WorkModeDto> Handle(UpdateWorkModeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workMode = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Work mode with ID {request.Id} not found.");

            workMode.Name = request.Name;
            workMode.UpdatedAt = DateTime.UtcNow;
            workMode.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(workMode, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new WorkModeDto(
                workMode.Id, workMode.Name, workMode.CreatedAt, workMode.CreatedByUserId,
                workMode.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                workMode.UpdatedAt, workMode.UpdatedByUserId,
                workMode.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating work mode id={Id}", request.Id);
            throw;
        }
    }
}
