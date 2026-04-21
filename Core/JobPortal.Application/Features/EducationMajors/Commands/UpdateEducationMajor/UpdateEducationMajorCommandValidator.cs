using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.EducationMajors.Commands.UpdateEducationMajor;

public class UpdateEducationMajorCommandValidator : AbstractValidator<UpdateEducationMajorCommand>
{
    public UpdateEducationMajorCommandValidator(IEducationMajorRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Education major name is required.")
            .MaximumLength(150).WithMessage("Education major name must not exceed 150 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("An education major with this name already exists.");
    }
}
