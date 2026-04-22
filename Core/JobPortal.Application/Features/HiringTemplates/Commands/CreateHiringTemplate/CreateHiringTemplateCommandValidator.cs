using FluentValidation;

namespace JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;

public class CreateHiringTemplateCommandValidator : AbstractValidator<CreateHiringTemplateCommand>
{
    public CreateHiringTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description is not null);
        RuleFor(x => x.Steps).NotEmpty().WithMessage("At least one step is required.");
        RuleForEach(x => x.Steps).ChildRules(step =>
        {
            step.RuleFor(s => s.Name).NotEmpty().MaximumLength(150);
        });
    }
}
