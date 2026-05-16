using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobCategories.Commands.UpdateJobCategory;

public class UpdateJobCategoryCommandHandler(
    IJobCategoryRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<UpdateJobCategoryCommandHandler> logger)
    : IRequestHandler<UpdateJobCategoryCommand, JobCategoryDto>
{
    public async Task<JobCategoryDto> Handle(UpdateJobCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobCategory = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job category with ID {request.Id} not found.");

            jobCategory.Name = request.Name;
            jobCategory.UpdatedAt = DateTime.UtcNow;
            jobCategory.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(jobCategory, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.JobCategories);

            return new JobCategoryDto(
                jobCategory.Id, jobCategory.Name, jobCategory.CreatedAt, jobCategory.CreatedByUserId,
                jobCategory.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                jobCategory.UpdatedAt, jobCategory.UpdatedByUserId,
                jobCategory.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating job category id={Id}", request.Id);
            throw;
        }
    }
}
