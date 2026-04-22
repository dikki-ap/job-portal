using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;

public class GetJobPostByIdQueryHandler(IJobPostRepository repository, ILogger<GetJobPostByIdQueryHandler> logger)
    : IRequestHandler<GetJobPostByIdQuery, JobPostDto?>
{
    public async Task<JobPostDto?> Handle(GetJobPostByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var jobPost = await repository.GetByIdAsync(request.Id, cancellationToken);
            return jobPost is null ? null : GetAllJobPostsQueryHandler.MapToDto(jobPost);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting job post id={Id}", request.Id);
            throw;
        }
    }
}
