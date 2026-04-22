using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;

public record GetJobPostByIdQuery(int Id) : IRequest<JobPostDto?>;
