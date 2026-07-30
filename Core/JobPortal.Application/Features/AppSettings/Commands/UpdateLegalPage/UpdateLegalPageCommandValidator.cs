using FluentValidation;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateLegalPage;

public class UpdateLegalPageCommandValidator : AbstractValidator<UpdateLegalPageCommand>
{
    public UpdateLegalPageCommandValidator()
    {
        RuleFor(x => x.PageType)
            .Must(t => t is "privacy" or "terms")
            .WithMessage("Page type must be 'privacy' or 'terms'.");

        RuleFor(x => x.Content)
            .MaximumLength(500_000)
            .WithMessage("Content must not exceed 500,000 characters.");
    }
}
