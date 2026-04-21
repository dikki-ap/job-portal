using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.CreateEmploymentType;

public class CreateEmploymentTypeCommandValidator : AbstractValidator<CreateEmploymentTypeCommand>
{
    public CreateEmploymentTypeCommandValidator(IEmploymentTypeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Employment type name is required.")
            .MaximumLength(100).WithMessage("Employment type name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("An employment type with this name already exists.");
    }
}
