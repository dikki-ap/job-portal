using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.Skills.Commands.UpdateSkill;

public class UpdateSkillCommandValidator : AbstractValidator<UpdateSkillCommand>
{
    public UpdateSkillCommandValidator(ISkillRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Skill name is required.")
            .MaximumLength(100).WithMessage("Skill name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("A skill with this name already exists.");
    }
}
