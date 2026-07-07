using FluentValidation;

namespace PocketLedger.Application.Features.Auth.Commands.VerifyPin;

public class VerifyPinCommandValidator : AbstractValidator<VerifyPinCommand>
{
    public VerifyPinCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Pin)
            .NotEmpty().WithMessage("PIN is required.")
            .Length(4).WithMessage("PIN must be exactly 4 digits.")
            .Matches("^[0-9]+$").WithMessage("PIN must contain only digits.");
    }
}
