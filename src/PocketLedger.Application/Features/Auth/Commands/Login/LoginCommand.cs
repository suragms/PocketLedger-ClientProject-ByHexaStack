using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.Login;

public class LoginCommand : IRequest<Auth.DTOs.AuthResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
}
