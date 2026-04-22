using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Applications;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Applications.Commands.CreateApplication;

public class CreateApplicationCommandHandler(
    IApplicationRepository applicationRepository,
    IJobPostRepository jobPostRepository,
    ICurrentUserService currentUserService,
    ILogger<CreateApplicationCommandHandler> logger)
    : IRequestHandler<CreateApplicationCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(CreateApplicationCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var jobPost = await jobPostRepository.GetByIdAsync(request.JobPostId, cancellationToken)
            ?? throw new KeyNotFoundException($"Job post {request.JobPostId} not found.");

        if (jobPost.Status != "Published")
            throw new InvalidOperationException("This job post is not accepting applications.");

        if (await applicationRepository.ExistsAsync(userId, request.JobPostId, cancellationToken))
            throw new InvalidOperationException("You have already applied to this job post.");

        var now = DateTime.UtcNow;

        var application = new Domain.Entities.Applications.Application
        {
            JobPostId = request.JobPostId,
            UserId = userId,
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
            Documents = request.DocumentIds
                .Select(docId => new ApplicationDocument
                {
                    DocumentId = docId,
                    DocumentType = string.Empty,
                    CreatedAt = now,
                    CreatedByUserId = userId,
                })
                .ToList(),
        };

        await applicationRepository.AddAsync(application, cancellationToken);
        await applicationRepository.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Application created id={Id} userId={UserId} jobPostId={JobPostId}",
            application.Id, userId, request.JobPostId);

        var full = await applicationRepository.GetByIdAsync(application.Id, cancellationToken);
        return GetAllApplicationsQueryHandler.MapToDto(full!);
    }
}
