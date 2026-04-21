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
    }
}
