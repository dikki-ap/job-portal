using FluentValidation;

namespace JobPortal.Application.Features.Applications.Commands.ScheduleApplicationStep;

public class ScheduleApplicationStepCommandValidator : AbstractValidator<ScheduleApplicationStepCommand>
{
    public ScheduleApplicationStepCommandValidator()
    {
        RuleFor(x => x.ApplicationId).GreaterThan(0).WithMessage("Application ID is required.");
        RuleFor(x => x.StepId).GreaterThan(0).WithMessage("Step ID is required.");

        RuleFor(x => x.ScheduledLocation)
            .MaximumLength(500).WithMessage("Location must not exceed 500 characters.")
            .When(x => x.ScheduledLocation != null);

        RuleFor(x => x.ScheduledNote)
            .MaximumLength(2000).WithMessage("Note must not exceed 2000 characters.")
            .When(x => x.ScheduledNote != null);
    }
}
