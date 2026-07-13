using FluentValidation;

namespace PocketLedger.Application.Features.Transactions.Commands.ImportTransactions;

public class ImportTransactionsCommandValidator : AbstractValidator<ImportTransactionsCommand>
{
    public ImportTransactionsCommandValidator()
    {
        RuleFor(x => x.AccountId).GreaterThan(0).WithMessage("Account is required.");
        RuleFor(x => x.DateColumn).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DescriptionColumn).GreaterThanOrEqualTo(0);
        RuleFor(x => x.AmountColumn).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TypeColumn).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FileName).NotEmpty().WithMessage("File is required.");
    }
}
