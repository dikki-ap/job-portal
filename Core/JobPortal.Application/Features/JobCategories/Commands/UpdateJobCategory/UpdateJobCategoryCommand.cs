using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobCategories.Commands.UpdateJobCategory;

public record UpdateJobCategoryCommand(int Id, string Name) : IRequest<JobCategoryDto>;
