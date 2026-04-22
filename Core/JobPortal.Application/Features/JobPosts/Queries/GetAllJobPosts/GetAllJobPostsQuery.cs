using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;

public record GetAllJobPostsQuery : IRequest<IEnumerable<JobPostDto>>;
