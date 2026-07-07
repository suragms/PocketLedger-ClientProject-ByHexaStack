using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RefreshTokenCommandHandler(UserManager<User> userManager, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (!_jwtTokenGenerator.ValidateToken(request.Token))
            throw new UnauthorizedAccessException("Invalid token.");

        var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken && u.RefreshTokenExpiry > DateTime.UtcNow);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var roles = await _userManager.GetRolesAsync(user);
        var newToken = _jwtTokenGenerator.GenerateToken(user, roles);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
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
