using FluentValidation;
using JobPortal.Application.Common;

namespace JobPortal.Application.Features.Applications.Commands.BulkUpdateApplicationStep;

public class BulkUpdateApplicationStepCommandValidator : AbstractValidator<BulkUpdateApplicationStepCommand>
{
    public BulkUpdateApplicationStepCommandValidator()
    {
        RuleFor(x => x.ApplicationIds)
            .NotNull().NotEmpty().WithMessage("At least one application ID is required.")
            .Must(ids => ids.Count <= 500).WithMessage("Cannot process more than 500 applications at once.");

        RuleFor(x => x.Action)
            .Must(a => a == ApplicationStepStatus.Passed || a == ApplicationStepStatus.Failed)
            .WithMessage("Action must be 'Passed' or 'Failed'.");
    }
}
