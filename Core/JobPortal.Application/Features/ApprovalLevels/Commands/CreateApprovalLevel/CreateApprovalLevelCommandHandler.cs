using JobPortal.Application.DTOs;
using JobPortal.Application.Features.ApprovalLevels.Queries.GetApprovalLevels;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.CreateApprovalLevel;

public class CreateApprovalLevelCommandHandler(
    IApprovalLevelRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateApprovalLevelCommandHandler> logger)
    : IRequestHandler<CreateApprovalLevelCommand, ApprovalLevelDto>
{
    public async Task<ApprovalLevelDto> Handle(CreateApprovalLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId() ?? 0;

            var level = new ApprovalLevel
            {
                Name = request.Name,
                LevelOrder = request.LevelOrder,
                ApproverName = request.ApproverName,
                ApproverEmail = request.ApproverEmail.ToLowerInvariant(),
                IsActive = request.IsActive,
                CreatedAt = now,
                CreatedByUserId = userId,
            };

            await repository.AddAsync(level, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("ApprovalLevel created id={Id} order={Order}", level.Id, level.LevelOrder);

            var created = await repository.GetByIdAsync(level.Id, cancellationToken);
            return GetApprovalLevelsQueryHandler.MapToDto(created!);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating approval level name={Name}", request.Name);
            throw;
        }
    }
}
