using FluentValidation;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.UpdateRecurringTransaction;

public class UpdateRecurringTransactionCommandValidator : AbstractValidator<UpdateRecurringTransactionCommand>
{
    public UpdateRecurringTransactionCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than 0.");
        RuleFor(x => x.Currency).NotEmpty().Length(3).WithMessage("Currency must be 3 characters.");
        RuleFor(x => x.FrequencyDays).GreaterThan(0).WithMessage("Frequency must be at least 1 day.");
        RuleFor(x => x.NextDueDate).NotEmpty().WithMessage("Next due date is required.");
        RuleFor(x => x.AccountId).GreaterThan(0).WithMessage("Account is required.");
        RuleFor(x => x.Note).MaximumLength(500).WithMessage("Note must not exceed 500 characters.");
        RuleFor(x => x.Payee).MaximumLength(200).WithMessage("Payee must not exceed 200 characters.");
    }
}
