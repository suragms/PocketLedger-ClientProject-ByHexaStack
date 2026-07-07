using FluentValidation;

namespace PocketLedger.Application.Features.Transactions.Commands.UpdateTransaction;

public class UpdateTransactionCommandValidator : AbstractValidator<UpdateTransactionCommand>
{
    public UpdateTransactionCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than 0.");
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.AccountId).GreaterThan(0).WithMessage("Account is required.");
    }
}
