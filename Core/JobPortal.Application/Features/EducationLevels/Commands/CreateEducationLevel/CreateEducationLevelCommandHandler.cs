using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Commands.CreateEducationLevel;

public class CreateEducationLevelCommandHandler(
    IEducationLevelRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<CreateEducationLevelCommandHandler> logger)
    : IRequestHandler<CreateEducationLevelCommand, EducationLevelDto>
{
    public async Task<EducationLevelDto> Handle(CreateEducationLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationLevel = new EducationLevel
            {
                Name = request.Name,
                Level = request.Level,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(educationLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.EducationLevels);

            return new EducationLevelDto(
                educationLevel.Id, educationLevel.Name, educationLevel.Level,
                educationLevel.CreatedAt, educationLevel.CreatedByUserId, null,
                null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating education level name={Name}", request.Name);
            throw;
        }
    }
}
