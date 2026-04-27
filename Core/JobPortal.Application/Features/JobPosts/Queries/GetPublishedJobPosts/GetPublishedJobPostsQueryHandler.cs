using JobPortal.Application.DTOs;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedJobPosts;

public class GetPublishedJobPostsQueryHandler(
    IJobPostRepository repository,
    IDocumentTypeRepository documentTypeRepository,
    ILogger<GetPublishedJobPostsQueryHandler> logger)
    : IRequestHandler<GetPublishedJobPostsQuery, PagedResult<JobPostDto>>
{
    public async Task<PagedResult<JobPostDto>> Handle(GetPublishedJobPostsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var (items, totalCount) = await repository.GetPublishedPagedAsync(
                request.Search, request.CategoryIds, request.Page, request.PageSize, cancellationToken);
            var globalRequired = await documentTypeRepository.GetGloballyRequiredAsync(cancellationToken);

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
            var dtos = items.Select(j => GetAllJobPostsQueryHandler.MapToDto(j, globalRequired));

            return new PagedResult<JobPostDto>(dtos, totalCount, request.Page, request.PageSize, totalPages);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting published job posts");
            throw;
        }
    }
}
