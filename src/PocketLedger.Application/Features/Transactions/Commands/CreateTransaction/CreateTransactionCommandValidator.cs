using FluentValidation;

namespace PocketLedger.Application.Features.Transactions.Commands.CreateTransaction;

public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than 0.");
        RuleFor(x => x.Currency).NotEmpty().Length(3).WithMessage("Currency must be 3 characters.");
        RuleFor(x => x.Date).NotEmpty().WithMessage("Date is required.");
        RuleFor(x => x.AccountId).GreaterThan(0).WithMessage("Account is required.");
        RuleFor(x => x.Note).MaximumLength(500).WithMessage("Note must not exceed 500 characters.");
        RuleFor(x => x.Payee).MaximumLength(200).WithMessage("Payee must not exceed 200 characters.");
        RuleFor(x => x.Reference).MaximumLength(100).WithMessage("Reference must not exceed 100 characters.");
    }
}