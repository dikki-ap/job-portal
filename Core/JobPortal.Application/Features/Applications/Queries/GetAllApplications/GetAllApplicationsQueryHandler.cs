using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Queries.GetAllApplications;

public class GetAllApplicationsQueryHandler(
    IApplicationRepository repository,
    ILogger<GetAllApplicationsQueryHandler> logger)
    : IRequestHandler<GetAllApplicationsQuery, IEnumerable<ApplicationDto>>
{
    public async Task<IEnumerable<ApplicationDto>> Handle(GetAllApplicationsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(request.JobPostId, request.Status, cancellationToken);
            return items.Select(a => MapToDto(a));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting all applications");
            throw;
        }
    }

    internal static ApplicationDto MapToDto(
        Domain.Entities.Applications.Application a,
        bool excludeCompanyDocuments = false) => new(
        a.Id,
        a.Code,
        a.JobPostId,
        a.JobPost?.Title ?? string.Empty,
        a.JobPost?.Slug,
        a.JobPost?.City,
        a.JobPost?.Country,
        a.JobPost?.Department?.Name,
        a.JobPost?.EmploymentType?.Name,
        a.JobPost?.WorkMode?.Name,
        a.JobPost?.JobLevel?.Name,
        a.UserId,
        a.User is { } u ? $"{u.FirstName} {u.LastName}".Trim() : string.Empty,
        a.User?.Email ?? string.Empty,
        a.User?.Profile?.PhoneNumber,
        a.User?.Profile?.EducationLevel?.Name,
        a.User?.Profile?.EducationMajorCustom ?? a.User?.Profile?.EducationMajor?.Name,
        a.User?.Profile?.InstitutionName,
        a.User?.Profile?.EducationStartYear,
        a.User?.Profile?.EducationEndYear,
        a.User?.Profile?.DateOfBirth,
        a.Status,
        a.AppliedAt,
        a.UpdatedAt,
        a.Steps.OrderBy(s => s.StepOrder).Select(s => new ApplicationStepItemDto(
            s.Id, s.JobStepId, s.StepName, s.StepOrder,
            s.JobStep?.IsRequired ?? true, s.Status, s.CompletedAt,
            s.CompletedByUserId, s.CompletedByName,
            s.ScheduledAt, s.ScheduledLocation, s.ScheduledNote)),
        a.Documents
            .Where(d => !excludeCompanyDocuments || !d.IsCompanyDocument)
            .Select(d => new ApplicationDocumentDto(
                d.Id, d.DocumentType,
                d.Document?.OriginalFileName ?? string.Empty,
                d.Document?.FilePath ?? string.Empty,
                d.Document?.FileType ?? string.Empty,
                d.CreatedAt,
                d.IsCompanyDocument)),
        a.Rating,
        a.RatingNote,
        a.RatedAt,
        a.DmRating,
        a.DmRatingNote,
        a.DmRatedAt,
        a.Source);
}
