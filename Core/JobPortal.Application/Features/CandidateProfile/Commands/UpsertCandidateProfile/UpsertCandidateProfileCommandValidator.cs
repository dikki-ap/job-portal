using FluentValidation;

namespace JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;

public class UpsertCandidateProfileCommandValidator : AbstractValidator<UpsertCandidateProfileCommand>
{
    public UpsertCandidateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .MaximumLength(25).WithMessage("Phone number must not exceed 25 characters.");

        RuleFor(x => x.EducationMajorCustom)
            .MaximumLength(255).WithMessage("Education major must not exceed 255 characters.")
            .When(x => x.EducationMajorCustom != null);

        RuleFor(x => x.InstitutionName)
            .MaximumLength(255).WithMessage("Institution name must not exceed 255 characters.")
            .When(x => x.InstitutionName != null);

        RuleForEach(x => x.Skills)
            .ChildRules(skill =>
            {
                skill.RuleFor(s => s.SkillId).GreaterThan(0).WithMessage("Invalid skill ID.");
                skill.RuleFor(s => s.SkillLevel)
                    .NotEmpty().WithMessage("Skill level is required.")
                    .MaximumLength(50).WithMessage("Skill level must not exceed 50 characters.");
            })
            .When(x => x.Skills != null);
    }
}
