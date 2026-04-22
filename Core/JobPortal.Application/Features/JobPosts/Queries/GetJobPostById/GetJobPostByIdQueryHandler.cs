using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;

public class GetJobPostByIdQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    ILogger<GetJobPostByIdQueryHandler> logger)
    : IRequestHandler<GetJobPostByIdQuery, JobPostDto?>
{
    public async Task<JobPostDto?> Handle(GetJobPostByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (jobPost is null) return null;
            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);
            return GetAllJobPostsQueryHandler.MapToDto(jobPost, globalRequired);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting job post id={Id}", request.Id);
            throw;
        }
    }
}
