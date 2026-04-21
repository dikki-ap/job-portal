using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobCategories.Commands.CreateJobCategory;

public class CreateJobCategoryCommandHandler(
    IJobCategoryRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateJobCategoryCommandHandler> logger)
    : IRequestHandler<CreateJobCategoryCommand, JobCategoryDto>
{
    public async Task<JobCategoryDto> Handle(CreateJobCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobCategory = new JobCategory
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(jobCategory, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            return new JobCategoryDto(jobCategory.Id, jobCategory.Name, jobCategory.CreatedAt, jobCategory.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating job category name={Name}", request.Name);
            throw;
        }
    }
}
