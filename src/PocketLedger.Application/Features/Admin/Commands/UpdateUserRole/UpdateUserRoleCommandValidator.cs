using FluentValidation;

namespace PocketLedger.Application.Features.Admin.Commands.UpdateUserRole;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(r => new[] { "Admin", "User" }.Contains(r))
            .WithMessage("Role must be either 'Admin' or 'User'.");
    }
}
