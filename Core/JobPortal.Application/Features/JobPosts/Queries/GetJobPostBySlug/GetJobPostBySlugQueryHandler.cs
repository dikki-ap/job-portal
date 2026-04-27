using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostBySlug;

public class GetJobPostBySlugQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    ILogger<GetJobPostBySlugQueryHandler> logger)
    : IRequestHandler<GetJobPostBySlugQuery, JobPostDto?>
{
    public async Task<JobPostDto?> Handle(GetJobPostBySlugQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetBySlugAsync(request.Slug, cancellationToken);
            if (jobPost is null) return null;
            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);
            return GetAllJobPostsQueryHandler.MapToDto(jobPost, globalRequired);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting job post slug={Slug}", request.Slug);
            throw;
        }
    }
}
