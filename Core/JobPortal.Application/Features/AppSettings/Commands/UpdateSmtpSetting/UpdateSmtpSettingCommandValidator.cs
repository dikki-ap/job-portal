using FluentValidation;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;

public class UpdateSmtpSettingCommandValidator : AbstractValidator<UpdateSmtpSettingCommand>
{
    public UpdateSmtpSettingCommandValidator()
    {
        RuleFor(x => x.Host)
            .NotEmpty().WithMessage("SMTP host is required.")
            .MaximumLength(255).WithMessage("SMTP host must not exceed 255 characters.");

        RuleFor(x => x.Port)
            .InclusiveBetween(1, 65535).WithMessage("SMTP port must be between 1 and 65535.");

        RuleFor(x => x.SenderName)
            .NotEmpty().WithMessage("Sender name is required.")
            .MaximumLength(200).WithMessage("Sender name must not exceed 200 characters.");

        RuleFor(x => x.SenderEmail)
            .NotEmpty().WithMessage("Sender email is required.")
            .EmailAddress().WithMessage("Sender email must be a valid email address.")
            .MaximumLength(255).WithMessage("Sender email must not exceed 255 characters.");

        RuleFor(x => x.Username)
            .MaximumLength(255).WithMessage("Username must not exceed 255 characters.")
            .When(x => !string.IsNullOrEmpty(x.Username));
    }
}
