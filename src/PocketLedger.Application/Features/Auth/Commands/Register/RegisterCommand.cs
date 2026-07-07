using MediatR;
using PocketLedger.Application.Features.Auth.DTOs;

namespace PocketLedger.Application.Features.Auth.Commands.Register;

public class RegisterCommand : IRequest<AuthResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
