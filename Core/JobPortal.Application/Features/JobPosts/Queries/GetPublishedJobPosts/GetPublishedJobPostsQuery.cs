using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedJobPosts;

public record GetPublishedJobPostsQuery(
    string? Search,
    int? CategoryId,
    int Page,
    int PageSize) : IRequest<PagedResult<JobPostDto>>;
