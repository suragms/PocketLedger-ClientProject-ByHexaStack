using FluentValidation;

namespace PocketLedger.Application.Features.Auth.Commands.DeleteAccount;

public class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required to delete account.");
    }
}
