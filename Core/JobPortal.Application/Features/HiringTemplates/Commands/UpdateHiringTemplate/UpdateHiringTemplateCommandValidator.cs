using FluentValidation;
using JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;

namespace JobPortal.Application.Features.HiringTemplates.Commands.UpdateHiringTemplate;

public class UpdateHiringTemplateCommandValidator : AbstractValidator<UpdateHiringTemplateCommand>
{
    public UpdateHiringTemplateCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description is not null);
        RuleFor(x => x.Steps).NotEmpty().WithMessage("At least one step is required.");
        RuleForEach(x => x.Steps).ChildRules(step =>
        {
            step.RuleFor(s => s.Name).NotEmpty().MaximumLength(150);
        });
    }
}
