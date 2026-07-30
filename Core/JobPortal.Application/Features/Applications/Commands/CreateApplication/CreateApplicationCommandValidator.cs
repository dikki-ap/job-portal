using FluentValidation;

namespace JobPortal.Application.Features.Applications.Commands.CreateApplication;

public class CreateApplicationCommandValidator : AbstractValidator<CreateApplicationCommand>
{
    public CreateApplicationCommandValidator()
    {
        RuleFor(x => x.JobPostId).GreaterThan(0);

        RuleFor(x => x.Source)
            .MaximumLength(50).WithMessage("Source must not exceed 50 characters.")
            .When(x => x.Source != null);

        RuleForEach(x => x.Documents)
            .ChildRules(doc =>
            {
                doc.RuleFor(d => d.DocumentId).GreaterThan(0).WithMessage("Invalid document ID.");
                doc.RuleFor(d => d.DocumentTypeName)
                    .NotEmpty().WithMessage("Document type name is required.")
                    .MaximumLength(100).WithMessage("Document type name must not exceed 100 characters.");
            })
            .When(x => x.Documents != null && x.Documents.Count > 0);
    }
}
