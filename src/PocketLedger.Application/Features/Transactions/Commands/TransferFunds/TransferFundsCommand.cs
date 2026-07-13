using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Commands.TransferFunds;

public class TransferFundsCommand : IRequest<TransferResult>
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public int FromAccountId { get; set; }
    public int ToAccountId { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
}

public class TransferResult
{
    public TransactionDto SourceTransaction { get; set; } = null!;
    public TransactionDto DestinationTransaction { get; set; } = null!;
    public Guid TransferGroupId { get; set; }
}
