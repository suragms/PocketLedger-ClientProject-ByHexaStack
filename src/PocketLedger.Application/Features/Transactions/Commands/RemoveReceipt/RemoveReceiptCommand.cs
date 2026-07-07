using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Commands.RemoveReceipt;

public class RemoveReceiptCommand : IRequest<TransactionDto>
{
    public int TransactionId { get; set; }
}