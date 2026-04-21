using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.JobLevels.Commands.CreateJobLevel;

public class CreateJobLevelCommandValidator : AbstractValidator<CreateJobLevelCommand>
{
    public CreateJobLevelCommandValidator(IJobLevelRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job level name is required.")
            .MaximumLength(100).WithMessage("Job level name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("A job level with this name already exists.");
    }
}
