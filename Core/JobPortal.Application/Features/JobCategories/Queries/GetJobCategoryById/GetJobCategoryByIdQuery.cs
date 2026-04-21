using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobCategories.Queries.GetJobCategoryById;

public record GetJobCategoryByIdQuery(int Id) : IRequest<JobCategoryDto?>;
