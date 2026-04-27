using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobPosts.Queries.GetJobPostBySlug;

public record GetJobPostBySlugQuery(string Slug) : IRequest<JobPostDto?>;
