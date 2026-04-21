using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobCategories.Commands.CreateJobCategory;

public record CreateJobCategoryCommand(string Name) : IRequest<JobCategoryDto>;
