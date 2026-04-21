using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Commands.CreateWorkMode;

public class CreateWorkModeCommandHandler(
    IWorkModeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateWorkModeCommandHandler> logger)
    : IRequestHandler<CreateWorkModeCommand, WorkModeDto>
{
    public async Task<WorkModeDto> Handle(CreateWorkModeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var workMode = new WorkMode
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(workMode, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return new WorkModeDto(workMode.Id, workMode.Name, workMode.CreatedAt, workMode.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating work mode name={Name}", request.Name);
            throw;
        }
    }
}
