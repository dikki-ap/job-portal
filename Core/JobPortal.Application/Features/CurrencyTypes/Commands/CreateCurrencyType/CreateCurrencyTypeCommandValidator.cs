using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.CreateCurrencyType;

public class CreateCurrencyTypeCommandValidator : AbstractValidator<CreateCurrencyTypeCommand>
{
    public CreateCurrencyTypeCommandValidator(ICurrencyTypeRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Currency type name is required.")
            .MaximumLength(100).WithMessage("Currency type name must not exceed 100 characters.")
            .MustAsync(async (name, ct) => !await repository.ExistsByNameAsync(name, null, ct))
            .WithMessage("A currency type with this name already exists.");

        RuleFor(x => x.Prefix)
            .NotEmpty().WithMessage("Prefix is required.")
            .MaximumLength(10).WithMessage("Prefix must not exceed 10 characters.");
    }
}
