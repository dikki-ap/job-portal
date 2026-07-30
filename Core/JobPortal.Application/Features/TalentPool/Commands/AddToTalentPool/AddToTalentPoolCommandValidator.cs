using FluentValidation;

namespace JobPortal.Application.Features.TalentPool.Commands.AddToTalentPool;

public class AddToTalentPoolCommandValidator : AbstractValidator<AddToTalentPoolCommand>
{
    public AddToTalentPoolCommandValidator()
    {
        RuleFor(x => x.ApplicationId).GreaterThan(0).WithMessage("Application ID is required.");
        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.")
            .When(x => x.Notes != null);
    }
}
