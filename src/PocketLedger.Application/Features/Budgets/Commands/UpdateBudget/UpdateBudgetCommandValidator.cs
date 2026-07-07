using FluentValidation;

namespace PocketLedger.Application.Features.Budgets.Commands.UpdateBudget;

public class UpdateBudgetCommandValidator : AbstractValidator<UpdateBudgetCommand>
{
    public UpdateBudgetCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Budget ID is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Budget amount must be greater than 0.");
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate).When(x => x.EndDate.HasValue)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.AlertThreshold)
            .InclusiveBetween(0, 100).When(x => x.AlertThreshold.HasValue)
            .WithMessage("Alert threshold must be between 0 and 100.");
    }
}
