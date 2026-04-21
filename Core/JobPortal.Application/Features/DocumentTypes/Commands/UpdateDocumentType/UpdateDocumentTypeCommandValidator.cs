using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.DocumentTypes.Commands.UpdateDocumentType;

public class UpdateDocumentTypeCommandValidator : AbstractValidator<UpdateDocumentTypeCommand>
{
    public UpdateDocumentTypeCommandValidator(IDocumentTypeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Document type name is required.")
            .MaximumLength(100).WithMessage("Document type name must not exceed 100 characters.")
            .MustAsync(async (command, name, ct) => !await repository.ExistsByNameAsync(name, command.Id, ct))
            .WithMessage("A document type with this name already exists.");

        RuleFor(x => x.MaxFileSizeMb)
            .GreaterThan(0).WithMessage("Max file size must be greater than 0.")
            .LessThanOrEqualTo(50).WithMessage("Max file size must not exceed 50 MB.");

        RuleFor(x => x.MimeTypes)
            .NotEmpty().WithMessage("At least one MIME type is required.")
            .Must(types => types.All(t => !string.IsNullOrWhiteSpace(t) && t.Contains('/')))
            .WithMessage("One or more MIME types have an invalid format.")
            .Must(types => types.Distinct(StringComparer.OrdinalIgnoreCase).Count() == types.Count)
            .WithMessage("Duplicate MIME types are not allowed.");
    }
}
