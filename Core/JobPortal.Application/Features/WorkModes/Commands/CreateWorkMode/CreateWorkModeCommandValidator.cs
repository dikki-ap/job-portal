using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.WorkModes.Commands.CreateWorkMode;

public class CreateWorkModeCommandValidator : AbstractValidator<CreateWorkModeCommand>
{
    public CreateWorkModeCommandValidator(IWorkModeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Work mode name is required.")
            .MaximumLength(100).WithMessage("Work mode name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("A work mode with this name already exists.");
    }
}
