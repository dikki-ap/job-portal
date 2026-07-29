using FluentValidation;
using System.Text.RegularExpressions;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;

public partial class UpdateBrandingSettingCommandValidator : AbstractValidator<UpdateBrandingSettingCommand>
{
    [GeneratedRegex(@"^#[0-9a-fA-F]{6}$")]
    private static partial Regex HexColorRegex();

    public UpdateBrandingSettingCommandValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(200).WithMessage("Company name must not exceed 200 characters.");

        RuleFor(x => x.PrimaryColor)
            .NotEmpty().WithMessage("Primary color is required.")
            .Matches(HexColorRegex()).WithMessage("Primary color must be a valid hex color (e.g. #1a2b3c).");

        RuleFor(x => x.PrimaryHoverColor)
            .NotEmpty().WithMessage("Primary hover color is required.")
            .Matches(HexColorRegex()).WithMessage("Primary hover color must be a valid hex color (e.g. #1a2b3c).");

        RuleFor(x => x.GradientMidColor)
            .NotEmpty().WithMessage("Gradient mid color is required.")
            .Matches(HexColorRegex()).WithMessage("Gradient mid color must be a valid hex color (e.g. #1a2b3c).");

        RuleFor(x => x.GradientEndColor)
            .NotEmpty().WithMessage("Gradient end color is required.")
            .Matches(HexColorRegex()).WithMessage("Gradient end color must be a valid hex color (e.g. #1a2b3c).");

        RuleFor(x => x.ContactEmail)
            .EmailAddress().WithMessage("Contact email must be a valid email address.")
            .MaximumLength(255).WithMessage("Contact email must not exceed 255 characters.")
            .When(x => !string.IsNullOrEmpty(x.ContactEmail));

        RuleFor(x => x.ContactPhone)
            .MaximumLength(50).WithMessage("Contact phone must not exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.ContactPhone));

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Address must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Address));

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description must not exceed 5000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Timezone)
            .MaximumLength(100).WithMessage("Timezone must not exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Timezone));
    }
}
