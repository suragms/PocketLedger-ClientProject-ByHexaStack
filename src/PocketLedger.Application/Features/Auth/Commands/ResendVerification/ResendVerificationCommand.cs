using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.ResendVerification;

public class ResendVerificationCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
}
