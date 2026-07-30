using FluentValidation;

namespace JobPortal.Application.Features.JobPosts.Commands.RejectJobPostStep;

public class RejectJobPostStepCommandValidator : AbstractValidator<RejectJobPostStepCommand>
{
    public RejectJobPostStepCommandValidator()
    {
        RuleFor(x => x.JobPostId).GreaterThan(0).WithMessage("Job post ID is required.");
        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Comment is required when rejecting.")
            .MaximumLength(1000).WithMessage("Comment must not exceed 1000 characters.");
    }
}
