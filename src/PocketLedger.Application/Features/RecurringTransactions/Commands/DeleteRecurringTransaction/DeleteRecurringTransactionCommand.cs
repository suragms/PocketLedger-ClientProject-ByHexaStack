using MediatR;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.DeleteRecurringTransaction;

public class DeleteRecurringTransactionCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
