using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobCategories.Queries.GetJobCategoryById;

public class GetJobCategoryByIdQueryHandler(IJobCategoryRepository repository, ILogger<GetJobCategoryByIdQueryHandler> logger)
    : IRequestHandler<GetJobCategoryByIdQuery, JobCategoryDto?>
{
    public async Task<JobCategoryDto?> Handle(GetJobCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var jobCategory = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (jobCategory is null) return null;

            return new JobCategoryDto(
                jobCategory.Id, jobCategory.Name, jobCategory.CreatedAt, jobCategory.CreatedByUserId,
                jobCategory.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                jobCategory.UpdatedAt, jobCategory.UpdatedByUserId,
                jobCategory.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting job category id={Id}", request.Id);
            throw;
        }
    }
}
