using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.EducationLevels.Commands.CreateEducationLevel;

public class CreateEducationLevelCommandValidator : AbstractValidator<CreateEducationLevelCommand>
{
    public CreateEducationLevelCommandValidator(IEducationLevelRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Education level name is required.")
            .MaximumLength(100).WithMessage("Education level name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("An education level with this name already exists.");

        RuleFor(x => x.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0.");
    }
}
