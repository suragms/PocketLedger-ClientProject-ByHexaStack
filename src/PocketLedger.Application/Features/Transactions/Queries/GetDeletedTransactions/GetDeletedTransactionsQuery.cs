using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Queries.GetDeletedTransactions;

public class GetDeletedTransactionsQuery : IRequest<List<TransactionDto>>
{
}