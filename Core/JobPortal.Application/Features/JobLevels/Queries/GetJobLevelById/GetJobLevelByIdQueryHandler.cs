using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobLevels.Queries.GetJobLevelById;

public class GetJobLevelByIdQueryHandler(IJobLevelRepository repository, ILogger<GetJobLevelByIdQueryHandler> logger)
    : IRequestHandler<GetJobLevelByIdQuery, JobLevelDto?>
{
    public async Task<JobLevelDto?> Handle(GetJobLevelByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var jobLevel = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (jobLevel is null) return null;

            return new JobLevelDto(
                jobLevel.Id, jobLevel.Name, jobLevel.CreatedAt, jobLevel.CreatedByUserId,
                jobLevel.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                jobLevel.UpdatedAt, jobLevel.UpdatedByUserId,
                jobLevel.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting job level id={Id}", request.Id);
            throw;
        }
    }
}
