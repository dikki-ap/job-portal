using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Commands.UpdateJobPost;

public record UpdateJobPostCommand(
    int Id,
    string Title,
    string Description,
    string Location,
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
    List<CreateRequiredDocumentRequest> RequiredDocuments) : IRequest<JobPostDto>;
