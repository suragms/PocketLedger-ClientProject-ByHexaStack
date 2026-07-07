using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Commands.UploadReceipt;

public class UploadReceiptCommand : IRequest<TransactionDto>
{
    public int TransactionId { get; set; }
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}