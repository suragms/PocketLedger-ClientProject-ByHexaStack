using MediatR;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.ToggleRecurringTransaction;

public class ToggleRecurringTransactionCommand : IRequest<RecurringTransactionDto>
{
    public int Id { get; set; }
}
