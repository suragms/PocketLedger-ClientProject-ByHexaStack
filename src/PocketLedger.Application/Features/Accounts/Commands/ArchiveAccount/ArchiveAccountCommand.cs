using MediatR;

namespace PocketLedger.Application.Features.Accounts.Commands.ArchiveAccount;

public class ArchiveAccountCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
