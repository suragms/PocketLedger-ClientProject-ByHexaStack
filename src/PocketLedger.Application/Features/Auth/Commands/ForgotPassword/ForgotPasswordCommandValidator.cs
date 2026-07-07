using FluentValidation;

namespace PocketLedger.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email is required.");
    }
}
