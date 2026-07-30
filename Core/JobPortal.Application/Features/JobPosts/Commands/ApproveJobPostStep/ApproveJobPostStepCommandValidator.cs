using FluentValidation;

namespace JobPortal.Application.Features.JobPosts.Commands.ApproveJobPostStep;

public class ApproveJobPostStepCommandValidator : AbstractValidator<ApproveJobPostStepCommand>
{
    public ApproveJobPostStepCommandValidator()
    {
        RuleFor(x => x.JobPostId).GreaterThan(0).WithMessage("Job post ID is required.");
        RuleFor(x => x.Comment)
            .MaximumLength(1000).WithMessage("Comment must not exceed 1000 characters.")
            .When(x => x.Comment != null);
    }
}
