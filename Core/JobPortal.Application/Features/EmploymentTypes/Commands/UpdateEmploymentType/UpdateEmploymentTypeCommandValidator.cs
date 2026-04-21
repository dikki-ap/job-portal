using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.UpdateEmploymentType;

public class UpdateEmploymentTypeCommandValidator : AbstractValidator<UpdateEmploymentTypeCommand>
{
    public UpdateEmploymentTypeCommandValidator(IEmploymentTypeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Employment type name is required.")
            .MaximumLength(100).WithMessage("Employment type name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("An employment type with this name already exists.");
    }
}
