using FluentValidation;
using JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;

namespace JobPortal.Application.Features.JobPosts.Commands.UpdateJobPost;

public class UpdateJobPostCommandValidator : AbstractValidator<UpdateJobPostCommand>
{
    public UpdateJobPostCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required.").MaximumLength(255);
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required.");
        RuleFor(x => x.City).NotEmpty().WithMessage("City is required.").MaximumLength(255);
        RuleFor(x => x.Country).NotEmpty().WithMessage("Country is required.").MaximumLength(255);
        RuleFor(x => x.DepartmentId).GreaterThan(0).WithMessage("Department is required.");
        RuleFor(x => x.JobCategoryId).GreaterThan(0).WithMessage("Job category is required.");
        RuleFor(x => x.JobLevelId).GreaterThan(0).WithMessage("Job level is required.");
        RuleFor(x => x.EmploymentTypeId).GreaterThan(0).WithMessage("Employment type is required.");
        RuleFor(x => x.WorkModeId).GreaterThan(0).WithMessage("Work mode is required.");
        RuleFor(x => x.MinExperienceYears).GreaterThanOrEqualTo(0).WithMessage("Experience years must be 0 or more.");
        RuleFor(x => x.Quota).GreaterThan(0).WithMessage("Quota must be at least 1.");
        RuleFor(x => x.Steps).NotEmpty().WithMessage("At least one hiring step is required.");
        RuleForEach(x => x.Steps).ChildRules(step =>
        {
            step.RuleFor(s => s.Name).NotEmpty().WithMessage("Step name is required.").MaximumLength(150);
        });
        When(x => x.MinSalary.HasValue && x.MaxSalary.HasValue, () =>
        {
            RuleFor(x => x.MaxSalary).GreaterThanOrEqualTo(x => x.MinSalary)
                .WithMessage("Max salary must be greater than or equal to min salary.");
        });
    }
}
