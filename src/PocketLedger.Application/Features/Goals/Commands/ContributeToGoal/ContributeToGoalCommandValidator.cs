using FluentValidation;

namespace PocketLedger.Application.Features.Goals.Commands.ContributeToGoal;

public class ContributeToGoalCommandValidator : AbstractValidator<ContributeToGoalCommand>
{
    public ContributeToGoalCommandValidator()
    {
        RuleFor(x => x.GoalId).GreaterThan(0).WithMessage("Goal ID is required.");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Contribution amount must be greater than 0.");
    }
}
