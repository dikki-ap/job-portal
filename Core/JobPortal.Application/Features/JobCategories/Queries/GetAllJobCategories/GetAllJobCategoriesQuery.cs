using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobCategories.Queries.GetAllJobCategories;

public record GetAllJobCategoriesQuery : IRequest<IEnumerable<JobCategoryDto>>;
