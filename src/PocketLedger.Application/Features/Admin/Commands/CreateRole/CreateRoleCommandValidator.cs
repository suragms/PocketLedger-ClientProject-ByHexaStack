using FluentValidation;

namespace PocketLedger.Application.Features.Admin.Commands.CreateRole;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required.")
            .MaximumLength(50).WithMessage("Role name must not exceed 50 characters.")
            .Matches("^[a-zA-Z ]+$").WithMessage("Role name must contain only letters and spaces.");
        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Description must not exceed 200 characters.");
    }
}
