using FluentValidation;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.UpdateApprovalLevel;

public class UpdateApprovalLevelCommandValidator : AbstractValidator<UpdateApprovalLevelCommand>
{
    public UpdateApprovalLevelCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Approval level ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Approval level name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.LevelOrder)
            .GreaterThan(0).WithMessage("Level order must be a positive number.");

        RuleFor(x => x.ApproverName)
            .NotEmpty().WithMessage("Approver name is required.")
            .MaximumLength(200).WithMessage("Approver name must not exceed 200 characters.");

        RuleFor(x => x.ApproverEmail)
            .NotEmpty().WithMessage("Approver email is required.")
            .EmailAddress().WithMessage("Approver email must be a valid email address.")
            .MaximumLength(255).WithMessage("Approver email must not exceed 255 characters.");
    }
}
