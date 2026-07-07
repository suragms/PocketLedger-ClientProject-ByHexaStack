using FluentValidation;

namespace PocketLedger.Application.Features.Budgets.Commands.CreateBudget;

public class CreateBudgetCommandValidator : AbstractValidator<CreateBudgetCommand>
{
    public CreateBudgetCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Budget amount must be greater than 0.");
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.AlertThreshold)
            .InclusiveBetween(0, 100).When(x => x.AlertThreshold.HasValue)
            .WithMessage("Alert threshold must be between 0 and 100.");
    }
}
