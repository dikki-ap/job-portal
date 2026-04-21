using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.JobLevels.Commands.UpdateJobLevel;

public class UpdateJobLevelCommandValidator : AbstractValidator<UpdateJobLevelCommand>
{
    public UpdateJobLevelCommandValidator(IJobLevelRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job level name is required.")
            .MaximumLength(100).WithMessage("Job level name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("A job level with this name already exists.");
    }
}
