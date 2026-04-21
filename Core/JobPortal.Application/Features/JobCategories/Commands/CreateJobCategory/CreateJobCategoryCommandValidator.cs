using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.JobCategories.Commands.CreateJobCategory;

public class CreateJobCategoryCommandValidator : AbstractValidator<CreateJobCategoryCommand>
{
    public CreateJobCategoryCommandValidator(IJobCategoryRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job category name is required.")
            .MaximumLength(100).WithMessage("Job category name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("A job category with this name already exists.");
    }
}
