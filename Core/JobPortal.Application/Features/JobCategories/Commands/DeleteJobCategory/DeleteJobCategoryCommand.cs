using MediatR;

namespace JobPortal.Application.Features.JobCategories.Commands.DeleteJobCategory;

public record DeleteJobCategoryCommand(int Id) : IRequest<Unit>;
