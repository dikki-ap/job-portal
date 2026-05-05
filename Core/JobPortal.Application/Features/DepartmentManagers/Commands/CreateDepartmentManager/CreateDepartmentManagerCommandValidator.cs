using FluentValidation;
using JobPortal.Application.Interfaces.Repositories;

namespace JobPortal.Application.Features.DepartmentManagers.Commands.CreateDepartmentManager;

public class CreateDepartmentManagerCommandValidator : AbstractValidator<CreateDepartmentManagerCommand>
{
    public CreateDepartmentManagerCommandValidator(
        IDepartmentManagerRepository repository,
        IDepartmentRepository departmentRepository)
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(150).WithMessage("Full name must not exceed 150 characters.");

        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position is required.")
            .MaximumLength(100).WithMessage("Position must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.")
            .MustAsync(async (email, ct) => !await repository.ExistsByEmailAsync(email, null, ct))
            .WithMessage("A department manager with this email already exists.");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department is required.")
            .MustAsync(async (id, ct) => await departmentRepository.GetByIdAsync(id, ct) is not null)
            .WithMessage("The selected department does not exist.");
    }
}
