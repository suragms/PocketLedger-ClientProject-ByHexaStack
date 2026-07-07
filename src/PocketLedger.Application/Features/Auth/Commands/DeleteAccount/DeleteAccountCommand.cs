using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.DeleteAccount;

public class DeleteAccountCommand : IRequest<Unit>
{
    public string Password { get; set; } = string.Empty;
}
