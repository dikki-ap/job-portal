using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;

public class GetAllJobPostsQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    ILogger<GetAllJobPostsQueryHandler> logger)
    : IRequestHandler<GetAllJobPostsQuery, IEnumerable<JobPostDto>>
{
    public async Task<IEnumerable<JobPostDto>> Handle(GetAllJobPostsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);
            return items.Select(j => MapToDto(j, globalRequired));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting all job posts");
            throw;
        }
    }

    internal static JobPostDto MapToDto(Domain.Entities.Jobs.JobPost j, IReadOnlyCollection<(int Id, string Name)> globalRequired) => new(
        j.Id, j.Title, j.Slug, j.Status, j.City, j.Country, j.Description,
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
        j.JobSteps.OrderBy(s => s.StepOrder).Select(s => new JobStepDto(s.Id, s.Name, s.StepOrder, s.IsRequired,
            s.PassEmailSubject, s.PassEmailBody, s.FailEmailSubject, s.FailEmailBody)),
        j.RequiredSkills.Select(s => new JobSkillDto(s.SkillId, s.Skill?.Name ?? string.Empty)),
        MergeRequiredDocs(j, globalRequired),
        j.PreferredEducationMajors.Select(m => new JobMajorDto(m.EducationMajorId, m.EducationMajor?.Name ?? string.Empty)),
        j.CreatedAt,
        j.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null);

    internal static IEnumerable<JobRequiredDocumentDto> MergeRequiredDocs(
        Domain.Entities.Jobs.JobPost j,
        IReadOnlyCollection<(int Id, string Name)> globalRequired)
    {
        var stored = j.RequiredDocuments
            .Select(d => new JobRequiredDocumentDto(d.DocumentTypeId, d.DocumentType?.Name ?? string.Empty, d.IsRequired))
            .ToList();
        var existingIds = stored.Select(d => d.DocumentTypeId).ToHashSet();
        foreach (var (id, name) in globalRequired.Where(g => !existingIds.Contains(g.Id)))
            stored.Add(new JobRequiredDocumentDto(id, name, true));
        return stored;
    }
}
