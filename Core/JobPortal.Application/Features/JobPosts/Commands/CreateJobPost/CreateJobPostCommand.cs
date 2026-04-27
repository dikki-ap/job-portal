using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;

public record CreateJobPostCommand(
    string Title,
    string Description,
    string City,
    string Country,
    int DepartmentId,
    int WorkModeId,
    int EmploymentTypeId,
    int JobCategoryId,
    int JobLevelId,
    int? MinEducationLevelId,
    int MinExperienceYears,
    decimal? MinSalary,
    decimal? MaxSalary,
    bool IsSalaryVisible,
    int? CurrencyTypeId,
    int Quota,
    DateTime? PublishDate,
    DateTime? CloseDate,
    List<CreateJobStepRequest> Steps,
    List<int> RequiredSkillIds,
    List<CreateRequiredDocumentRequest> RequiredDocuments,
    List<int> PreferredMajorIds) : IRequest<JobPostDto>;
