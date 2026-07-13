using FluentValidation;

namespace PocketLedger.Application.Features.Transactions.Commands.TransferFunds;

public class TransferFundsCommandValidator : AbstractValidator<TransferFundsCommand>
{
    public TransferFundsCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Transfer amount must be greater than 0.");
        RuleFor(x => x.FromAccountId).GreaterThan(0).WithMessage("Source account is required.");
        RuleFor(x => x.ToAccountId).GreaterThan(0).WithMessage("Destination account is required.");
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x).Must(x => x.FromAccountId != x.ToAccountId).WithMessage("Source and destination accounts must be different.");
    }
}
