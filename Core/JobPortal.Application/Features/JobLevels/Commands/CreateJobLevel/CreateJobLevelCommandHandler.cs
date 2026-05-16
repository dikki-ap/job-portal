using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobLevels.Commands.CreateJobLevel;

public class CreateJobLevelCommandHandler(
    IJobLevelRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<CreateJobLevelCommandHandler> logger)
    : IRequestHandler<CreateJobLevelCommand, JobLevelDto>
{
    public async Task<JobLevelDto> Handle(CreateJobLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobLevel = new JobLevel
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(jobLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.JobLevels);
            return new JobLevelDto(jobLevel.Id, jobLevel.Name, jobLevel.CreatedAt, jobLevel.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating job level name={Name}", request.Name);
            throw;
        }
    }
}
