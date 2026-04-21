using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.WorkModes.Commands.UpdateWorkMode;

public class UpdateWorkModeCommandValidator : AbstractValidator<UpdateWorkModeCommand>
{
    public UpdateWorkModeCommandValidator(IWorkModeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Work mode name is required.")
            .MaximumLength(100).WithMessage("Work mode name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("A work mode with this name already exists.");
    }
}
