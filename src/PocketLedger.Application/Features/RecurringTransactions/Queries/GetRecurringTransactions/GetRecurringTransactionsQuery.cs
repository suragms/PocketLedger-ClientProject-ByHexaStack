using MediatR;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;

namespace PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactions;

public class GetRecurringTransactionsQuery : IRequest<List<RecurringTransactionDto>>
{
    public bool? IsActive { get; set; }
}
