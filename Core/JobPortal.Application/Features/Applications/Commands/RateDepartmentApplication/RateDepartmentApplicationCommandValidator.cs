using FluentValidation;

namespace JobPortal.Application.Features.Applications.Commands.RateDepartmentApplication;

public class RateDepartmentApplicationCommandValidator : AbstractValidator<RateDepartmentApplicationCommand>
{
    public RateDepartmentApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .GreaterThan(0).WithMessage("Application ID is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 10).WithMessage("Rating must be between 1 and 10.");

        RuleFor(x => x.Note)
            .MaximumLength(2000).WithMessage("Note must not exceed 2000 characters.")
            .When(x => x.Note != null);
    }
}
