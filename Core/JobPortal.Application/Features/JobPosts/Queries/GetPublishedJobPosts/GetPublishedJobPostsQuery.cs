using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetPublishedJobPosts;

public record GetPublishedJobPostsQuery(
    string? Search,
    IReadOnlyList<int>? CategoryIds,
    int Page,
    int PageSize) : IRequest<PagedResult<JobPostDto>>;
