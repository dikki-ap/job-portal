using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;

public class CreateJobPostCommandHandler(
    IJobPostRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateJobPostCommandHandler> logger)
    : IRequestHandler<CreateJobPostCommand, JobPostDto>
{
    public async Task<JobPostDto> Handle(CreateJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var slug = GenerateSlug(request.Title);
            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId() ?? 0;

            var jobPost = new JobPost
            {
                Title = request.Title,
                Slug = slug,
                Description = request.Description,
                Location = request.Location,
                Status = JobPostStatus.Draft,
                DepartmentId = request.DepartmentId,
                WorkModeId = request.WorkModeId,
                EmploymentTypeId = request.EmploymentTypeId,
                JobCategoryId = request.JobCategoryId,
                JobLevelId = request.JobLevelId,
                MinEducationLevelId = request.MinEducationLevelId,
                MinExperienceYears = request.MinExperienceYears,
                MinSalary = request.MinSalary,
                MaxSalary = request.MaxSalary,
                IsSalaryVisible = request.IsSalaryVisible,
                CurrencyTypeId = request.CurrencyTypeId,
                Quota = request.Quota,
                PublishDate = request.PublishDate,
                CloseDate = request.CloseDate,
                CreatedAt = now,
                CreatedByUserId = userId,
                JobSteps = request.Steps.Select((s, i) => new JobStep
                {
                    Name = s.Name,
                    StepOrder = i + 1,
                    IsRequired = s.IsRequired,
                    CreatedAt = now,
                    CreatedByUserId = userId,
                }).ToList(),
                RequiredSkills = request.RequiredSkillIds
                    .Select(skillId => new JobPostSkill { SkillId = skillId })
                    .ToList(),
                RequiredDocuments = request.RequiredDocuments
                    .Select(d => new JobPostRequiredDocument { DocumentTypeId = d.DocumentTypeId, IsRequired = d.IsRequired })
                    .ToList(),
            };

            await repository.AddAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new JobPostDto(
                jobPost.Id, jobPost.Title, jobPost.Slug, jobPost.Status,
                jobPost.Location, jobPost.Description,
                jobPost.DepartmentId, string.Empty,
                jobPost.JobCategoryId, string.Empty,
                jobPost.JobLevelId, string.Empty,
                jobPost.EmploymentTypeId, string.Empty,
                jobPost.WorkModeId, string.Empty,
                jobPost.MinEducationLevelId, null,
                jobPost.MinExperienceYears,
                jobPost.MinSalary, jobPost.MaxSalary, jobPost.IsSalaryVisible,
                jobPost.CurrencyTypeId, null,
                jobPost.Quota, jobPost.PublishDate, jobPost.CloseDate,
                jobPost.JobSteps.Select(s => new JobStepDto(s.Id, s.Name, s.StepOrder, s.IsRequired)),
                jobPost.RequiredSkills.Select(s => new JobSkillDto(s.SkillId, s.Skill?.Name ?? string.Empty)),
                jobPost.RequiredDocuments.Select(d => new JobRequiredDocumentDto(d.DocumentTypeId, d.DocumentType?.Name ?? string.Empty, d.IsRequired)),
                jobPost.CreatedAt, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating job post title={Title}", request.Title);
            throw;
        }
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace("/", "-");
        return $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";
    }
}
