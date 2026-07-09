using MediatR;

namespace PocketLedger.Application.Features.Accounts.Commands.RestoreAccount;

public class RestoreAccountCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
