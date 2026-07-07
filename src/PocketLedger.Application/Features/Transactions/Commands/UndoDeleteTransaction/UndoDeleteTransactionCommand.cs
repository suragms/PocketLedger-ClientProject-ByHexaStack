using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Commands.UndoDeleteTransaction;

public class UndoDeleteTransactionCommand : IRequest<TransactionDto>
{
    public int Id { get; set; }
}