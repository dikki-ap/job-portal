using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.JobCategories.Commands.UpdateJobCategory;

public class UpdateJobCategoryCommandValidator : AbstractValidator<UpdateJobCategoryCommand>
{
    public UpdateJobCategoryCommandValidator(IJobCategoryRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job category name is required.")
            .MaximumLength(100).WithMessage("Job category name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("A job category with this name already exists.");
    }
}
