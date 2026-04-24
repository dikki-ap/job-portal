using JobPortal.Application.DTOs;
using JobPortal.Application.Features.ApprovalLevels.Queries.GetApprovalLevels;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.UpdateApprovalLevel;

public class UpdateApprovalLevelCommandHandler(
    IApprovalLevelRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateApprovalLevelCommandHandler> logger)
    : IRequestHandler<UpdateApprovalLevelCommand, ApprovalLevelDto>
{
    public async Task<ApprovalLevelDto> Handle(UpdateApprovalLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var level = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Approval level with ID {request.Id} not found.");

            level.Name = request.Name;
            level.LevelOrder = request.LevelOrder;
            level.ApproverName = request.ApproverName;
            level.ApproverEmail = request.ApproverEmail.ToLowerInvariant();
            level.IsActive = request.IsActive;
            level.UpdatedAt = DateTime.UtcNow;
            level.UpdatedByUserId = currentUserService.GetCurrentUserId();

            await repository.UpdateAsync(level, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("ApprovalLevel updated id={Id}", level.Id);
            return GetApprovalLevelsQueryHandler.MapToDto(level);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating approval level id={Id}", request.Id);
            throw;
        }
    }
}
