using MediatR;
using PocketLedger.Application.Features.Auth.DTOs;

namespace PocketLedger.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResponse>
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
