using MediatR;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.VerifyPin;

public class VerifyPinCommand : IRequest<AuthResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
}
