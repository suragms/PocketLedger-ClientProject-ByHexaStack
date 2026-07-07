using FluentValidation;

namespace PocketLedger.Application.Features.Accounts.Commands.UpdateAccount;

public class UpdateAccountCommandValidator : AbstractValidator<UpdateAccountCommand>
{
    public UpdateAccountCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required.")
            .MaximumLength(100).WithMessage("Account name must not exceed 100 characters.");
    }
}
