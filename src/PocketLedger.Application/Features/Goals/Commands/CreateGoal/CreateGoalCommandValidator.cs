using FluentValidation;

namespace PocketLedger.Application.Features.Goals.Commands.CreateGoal;

public class CreateGoalCommandValidator : AbstractValidator<CreateGoalCommand>
{
    public CreateGoalCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TargetAmount).GreaterThan(0).WithMessage("Target amount must be greater than 0.");
        RuleFor(x => x.CurrentAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TargetDate).NotEmpty();
        RuleFor(x => x.TargetDate).GreaterThan(DateTime.UtcNow).When(x => x.TargetDate != default).WithMessage("Target date must be in the future.");
    }
}
