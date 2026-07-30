using System.Text.RegularExpressions;
using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Applications;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.TalentPool.Commands.ReengageCandidate;

public class ReengageCandidateCommandHandler(
    ITalentPoolRepository talentPoolRepository,
    IApplicationRepository applicationRepository,
    IJobPostRepository jobPostRepository,
    IEmailService emailService,
    IAppSettingRepository appSettingRepository,
    ILogger<ReengageCandidateCommandHandler> logger)
    : IRequestHandler<ReengageCandidateCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(ReengageCandidateCommand request, CancellationToken ct)
    {
        var entry = await talentPoolRepository.GetByIdAsync(request.TalentPoolEntryId, ct)
            ?? throw new KeyNotFoundException($"Talent pool entry {request.TalentPoolEntryId} not found.");

        var jobPost = await jobPostRepository.GetByIdAsync(request.JobPostId, ct)
            ?? throw new KeyNotFoundException($"Job post {request.JobPostId} not found.");

        if (jobPost.Status != JobPostStatus.Published)
            throw new InvalidOperationException("The selected job post is not published.");

        if (await applicationRepository.ExistsAsync(entry.UserId, request.JobPostId, ct))
            throw new InvalidOperationException(
                "This candidate already has an application for the selected position. Choose a different job post.");

        var email = entry.User?.Email ?? string.Empty;
        var prefix = Regex.Replace(email.Split('@')[0].ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        var code = $"{prefix}-{Guid.NewGuid().ToString("N")[..8]}";
        var now = DateTime.UtcNow;

        var application = new Domain.Entities.Applications.Application
        {
            JobPostId = request.JobPostId,
            UserId = entry.UserId,
            Code = code,
            Status = ApplicationStatus.Pending,
            AppliedAt = now,
            UpdatedAt = now,
            Steps = jobPost.JobSteps
                .OrderBy(s => s.StepOrder)
                .Select(s => new ApplicationStep
                {
                    JobStepId = s.Id,
                    StepName = s.Name,
                    StepOrder = s.StepOrder,
                    Status = ApplicationStepStatus.Pending,
                })
                .ToList(),
        };

        await applicationRepository.AddAsync(application, ct);

        talentPoolRepository.Remove(entry);

        await applicationRepository.SaveChangesAsync(ct);

        logger.LogInformation(
            "Re-engaged userId={UserId} for jobPostId={JobPostId} applicationCode={Code}",
            entry.UserId, request.JobPostId, code);

        var primaryColor = await appSettingRepository.GetValueAsync("BrandPrimaryColor", ct) ?? "#004181";
        var companyName  = await appSettingRepository.GetValueAsync("BrandCompanyName", ct)  ?? "JobPortal";

        var full = await applicationRepository.GetByIdAsync(application.Id, ct);
        await ApplicationEmailHelper.SendReengageAsync(emailService, logger, full!, primaryColor, companyName, CancellationToken.None);
        return GetAllApplicationsQueryHandler.MapToDto(full!);
    }
}
