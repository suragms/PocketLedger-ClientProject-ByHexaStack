using FluentValidation;

namespace PocketLedger.Application.Features.Goals.Commands.UpdateGoal;

public class UpdateGoalCommandValidator : AbstractValidator<UpdateGoalCommand>
{
    public UpdateGoalCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Goal ID is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TargetAmount).GreaterThan(0).WithMessage("Target amount must be greater than 0.");
        RuleFor(x => x.CurrentAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TargetDate).NotEmpty();
    }
}
