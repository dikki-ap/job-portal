using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Commands.UpdateJobPost;

public class UpdateJobPostCommandHandler(
    IJobPostRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateJobPostCommandHandler> logger)
    : IRequestHandler<UpdateJobPostCommand, JobPostDto>
{
    public async Task<JobPostDto> Handle(UpdateJobPostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job post with ID {request.Id} not found.");

            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId();

            jobPost.Title = request.Title;
            jobPost.Description = request.Description;
            jobPost.Location = request.Location;
            jobPost.DepartmentId = request.DepartmentId;
            jobPost.WorkModeId = request.WorkModeId;
            jobPost.EmploymentTypeId = request.EmploymentTypeId;
            jobPost.JobCategoryId = request.JobCategoryId;
            jobPost.JobLevelId = request.JobLevelId;
            jobPost.MinEducationLevelId = request.MinEducationLevelId;
            jobPost.MinExperienceYears = request.MinExperienceYears;
            jobPost.MinSalary = request.MinSalary;
            jobPost.MaxSalary = request.MaxSalary;
            jobPost.IsSalaryVisible = request.IsSalaryVisible;
            jobPost.CurrencyTypeId = request.CurrencyTypeId;
            jobPost.Quota = request.Quota;
            jobPost.PublishDate = request.PublishDate;
            jobPost.CloseDate = request.CloseDate;
            jobPost.UpdatedAt = now;
            jobPost.UpdatedByUserId = userId;

            // Merge steps in-place to avoid FK violations from ApplicationStep references.
            // Update existing steps positionally, add new ones, delete unreferenced trailing ones.
            var existingSteps = jobPost.JobSteps.OrderBy(s => s.StepOrder).ToList();
            var incomingSteps = request.Steps.ToList();

            for (int i = 0; i < incomingSteps.Count; i++)
            {
                if (i < existingSteps.Count)
                {
                    existingSteps[i].Name = incomingSteps[i].Name;
                    existingSteps[i].StepOrder = i + 1;
                    existingSteps[i].IsRequired = incomingSteps[i].IsRequired;
                }
                else
                {
                    jobPost.JobSteps.Add(new JobStep
                    {
                        Name = incomingSteps[i].Name,
                        StepOrder = i + 1,
                        IsRequired = incomingSteps[i].IsRequired,
                        CreatedAt = now,
                        CreatedByUserId = userId ?? 0,
                    });
                }
            }

            if (incomingSteps.Count < existingSteps.Count)
            {
                var stepsToRemove = existingSteps.Skip(incomingSteps.Count).ToList();
                var referencedIds = await repository.GetReferencedJobStepIdsAsync(
                    stepsToRemove.Select(s => s.Id), cancellationToken);
                foreach (var step in stepsToRemove.Where(s => !referencedIds.Contains(s.Id)))
                    jobPost.JobSteps.Remove(step);
            }

            jobPost.RequiredSkills.Clear();
            foreach (var skillId in request.RequiredSkillIds)
                jobPost.RequiredSkills.Add(new JobPostSkill { SkillId = skillId });

            jobPost.RequiredDocuments.Clear();
            foreach (var doc in request.RequiredDocuments)
                jobPost.RequiredDocuments.Add(new JobPostRequiredDocument { DocumentTypeId = doc.DocumentTypeId, IsRequired = doc.IsRequired });

            await repository.UpdateAsync(jobPost, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new JobPostDto(
                jobPost.Id, jobPost.Title, jobPost.Slug, jobPost.Status,
                jobPost.Location, jobPost.Description,
                jobPost.DepartmentId, jobPost.Department?.Name ?? string.Empty,
                jobPost.JobCategoryId, jobPost.JobCategory?.Name ?? string.Empty,
                jobPost.JobLevelId, jobPost.JobLevel?.Name ?? string.Empty,
                jobPost.EmploymentTypeId, jobPost.EmploymentType?.Name ?? string.Empty,
                jobPost.WorkModeId, jobPost.WorkMode?.Name ?? string.Empty,
                jobPost.MinEducationLevelId, jobPost.MinEducationLevel?.Name,
                jobPost.MinExperienceYears,
                jobPost.MinSalary, jobPost.MaxSalary, jobPost.IsSalaryVisible,
                jobPost.CurrencyTypeId, jobPost.CurrencyType?.Prefix,
                jobPost.Quota, jobPost.PublishDate, jobPost.CloseDate,
                jobPost.JobSteps.OrderBy(s => s.StepOrder).Select(s => new JobStepDto(s.Id, s.Name, s.StepOrder, s.IsRequired)),
                jobPost.RequiredSkills.Select(s => new JobSkillDto(s.SkillId, s.Skill?.Name ?? string.Empty)),
                jobPost.RequiredDocuments.Select(d => new JobRequiredDocumentDto(d.DocumentTypeId, d.DocumentType?.Name ?? string.Empty, d.IsRequired)),
                jobPost.CreatedAt,
                jobPost.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating job post id={Id}", request.Id);
            throw;
        }
    }
}
