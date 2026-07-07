using FluentValidation;

namespace PocketLedger.Application.Features.Accounts.Commands.CreateAccount;

public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required.")
            .MaximumLength(100).WithMessage("Account name must not exceed 100 characters.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .Length(3).WithMessage("Currency must be 3 characters.");

        RuleFor(x => x.Balance)
            .GreaterThanOrEqualTo(0).WithMessage("Balance cannot be negative for new accounts.");
    }
}
