using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.EducationMajors.Commands.CreateEducationMajor;

public class CreateEducationMajorCommandValidator : AbstractValidator<CreateEducationMajorCommand>
{
    public CreateEducationMajorCommandValidator(IEducationMajorRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Education major name is required.")
            .MaximumLength(150).WithMessage("Education major name must not exceed 150 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("An education major with this name already exists.");
    }
}
