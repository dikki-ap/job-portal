using FluentValidation;

namespace JobPortal.Application.Features.Applications.Commands.RateApplication;

public class RateApplicationCommandValidator : AbstractValidator<RateApplicationCommand>
{
    public RateApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .GreaterThan(0).WithMessage("Application ID is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 10).WithMessage("Rating must be between 1 and 10.");
    }
}
