using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Commands.UpdateEducationLevel;

public class UpdateEducationLevelCommandHandler(
    IEducationLevelRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateEducationLevelCommandHandler> logger)
    : IRequestHandler<UpdateEducationLevelCommand, EducationLevelDto>
{
    public async Task<EducationLevelDto> Handle(UpdateEducationLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationLevel = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Education level with ID {request.Id} not found.");

            educationLevel.Name = request.Name;
            educationLevel.Level = request.Level;
            educationLevel.UpdatedAt = DateTime.UtcNow;
            educationLevel.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(educationLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new EducationLevelDto(
                educationLevel.Id, educationLevel.Name, educationLevel.Level,
                educationLevel.CreatedAt, educationLevel.CreatedByUserId,
                educationLevel.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                educationLevel.UpdatedAt, educationLevel.UpdatedByUserId,
                educationLevel.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating education level id={Id}", request.Id);
            throw;
        }
    }
}
