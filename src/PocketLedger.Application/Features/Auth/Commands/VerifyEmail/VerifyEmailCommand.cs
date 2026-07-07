using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.VerifyEmail;

public class VerifyEmailCommand : IRequest<Unit>
{
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
