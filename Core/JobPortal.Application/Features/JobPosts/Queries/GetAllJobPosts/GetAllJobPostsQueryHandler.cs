using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;

public class GetAllJobPostsQueryHandler(IJobPostRepository repository, ILogger<GetAllJobPostsQueryHandler> logger)
    : IRequestHandler<GetAllJobPostsQuery, IEnumerable<JobPostDto>>
{
    public async Task<IEnumerable<JobPostDto>> Handle(GetAllJobPostsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(MapToDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting all job posts");
            throw;
        }
    }

    internal static JobPostDto MapToDto(Domain.Entities.Jobs.JobPost j) => new(
        j.Id, j.Title, j.Slug, j.Status, j.Location, j.Description,
        j.DepartmentId, j.Department?.Name ?? string.Empty,
        j.JobCategoryId, j.JobCategory?.Name ?? string.Empty,
        j.JobLevelId, j.JobLevel?.Name ?? string.Empty,
        j.EmploymentTypeId, j.EmploymentType?.Name ?? string.Empty,
        j.WorkModeId, j.WorkMode?.Name ?? string.Empty,
        j.MinEducationLevelId, j.MinEducationLevel?.Name,
        j.MinExperienceYears,
        j.MinSalary, j.MaxSalary, j.IsSalaryVisible,
        j.CurrencyTypeId, j.CurrencyType?.Prefix,
        j.Quota, j.PublishDate, j.CloseDate,
        j.JobSteps.OrderBy(s => s.StepOrder).Select(s => new JobStepDto(s.Id, s.Name, s.StepOrder, s.IsRequired)),
        j.RequiredSkills.Select(s => s.SkillId),
        j.CreatedAt,
        j.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null);
}
