using MediatR;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.Verify2FA;

public record Verify2FACommand : IRequest
{
    public string Code { get; set; } = string.Empty;
}

public class Verify2FACommandValidator : AbstractValidator<Verify2FACommand>
{
    public Verify2FACommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Matches(@"^\d{6}$").WithMessage("Code must be 6 digits");
    }
}

public class Verify2FACommandHandler : IRequestHandler<Verify2FACommand>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public Verify2FACommandHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(Verify2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        if (user.TwoFactorEnabled)
            throw new Exception("2FA is already enabled");

        if (string.IsNullOrEmpty(user.TwoFactorSecretKey))
            throw new Exception("2FA setup not initiated. Call enable-2fa first.");

        // Verify the TOTP code
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, request.Code);
        if (!isValid)
            throw new Exception("Invalid verification code");

        // Enable 2FA
        user.TwoFactorEnabled = true;
        user.TwoFactorEnabledAt = DateTime.UtcNow;
        await _userManager.SetTwoFactorEnabledAsync(user, true);
    }
}
