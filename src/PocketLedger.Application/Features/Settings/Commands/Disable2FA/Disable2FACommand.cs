using MediatR;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.Disable2FA;

public record Disable2FACommand : IRequest
{
    public string Password { get; set; } = string.Empty;
}

public class Disable2FACommandValidator : AbstractValidator<Disable2FACommand>
{
    public Disable2FACommandValidator()
    {
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class Disable2FACommandHandler : IRequestHandler<Disable2FACommand>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public Disable2FACommandHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(Disable2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        if (!user.TwoFactorEnabled)
            throw new Exception("2FA is not enabled");

        // Verify password before disabling
        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
            throw new Exception("Invalid password");

        user.TwoFactorEnabled = false;
        user.TwoFactorSecretKey = null;
        user.TwoFactorRecoveryCodes = Array.Empty<string>();
        user.TwoFactorEnabledAt = null;
        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.UpdateAsync(user);
    }
}
