using MediatR;

namespace PocketLedger.Application.Features.Transactions.Commands.DeleteTransaction;

public class DeleteTransactionCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
