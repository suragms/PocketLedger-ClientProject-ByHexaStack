using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.VerifyPin;

public class VerifyPinCommandHandler : IRequestHandler<VerifyPinCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPinService _pinService;

    public VerifyPinCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IPinService pinService)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _pinService = pinService;
    }

    public async Task<AuthResponse> Handle(VerifyPinCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.PinEnabled || string.IsNullOrEmpty(user.PinHash))
            throw new UnauthorizedAccessException("Invalid email or PIN.");

        if (!_pinService.VerifyPin(request.Pin, user.PinHash))
            throw new UnauthorizedAccessException("Invalid email or PIN.");

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(user, roles);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiration = DateTime.UtcNow.AddMinutes(60),
            User = new UserProfile
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                DefaultCurrency = user.DefaultCurrency,
                EmailVerified = user.EmailVerified,
                PinEnabled = user.PinEnabled,
                Roles = roles
            }
        };
    }
}
