using MediatR;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;

namespace PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactionById;

public class GetRecurringTransactionByIdQuery : IRequest<RecurringTransactionDto>
{
    public int Id { get; set; }
}
