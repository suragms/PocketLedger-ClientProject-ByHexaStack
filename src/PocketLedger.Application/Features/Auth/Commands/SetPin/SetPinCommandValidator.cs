using FluentValidation;

namespace PocketLedger.Application.Features.Auth.Commands.SetPin;

public class SetPinCommandValidator : AbstractValidator<SetPinCommand>
{
    public SetPinCommandValidator()
    {
        RuleFor(x => x.Pin)
            .NotEmpty().WithMessage("PIN is required.")
            .Length(4).WithMessage("PIN must be exactly 4 digits.")
            .Matches("^[0-9]+$").WithMessage("PIN must contain only digits.");
    }
}
