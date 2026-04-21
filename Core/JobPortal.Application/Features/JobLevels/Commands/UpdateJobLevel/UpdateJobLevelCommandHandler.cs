using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobLevels.Commands.UpdateJobLevel;

public class UpdateJobLevelCommandHandler(
    IJobLevelRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateJobLevelCommandHandler> logger)
    : IRequestHandler<UpdateJobLevelCommand, JobLevelDto>
{
    public async Task<JobLevelDto> Handle(UpdateJobLevelCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobLevel = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job level with ID {request.Id} not found.");

            jobLevel.Name = request.Name;
            jobLevel.UpdatedAt = DateTime.UtcNow;
            jobLevel.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(jobLevel, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new JobLevelDto(
                jobLevel.Id, jobLevel.Name, jobLevel.CreatedAt, jobLevel.CreatedByUserId,
                jobLevel.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                jobLevel.UpdatedAt, jobLevel.UpdatedByUserId,
                jobLevel.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating job level id={Id}", request.Id);
            throw;
        }
    }
}
