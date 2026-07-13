using MediatR;

namespace PocketLedger.Application.Features.Transactions.Commands.ImportTransactions;

public class ImportTransactionsCommand : IRequest<ImportResult>
{
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public int AccountId { get; set; }
    public int DateColumn { get; set; }
    public int DescriptionColumn { get; set; }
    public int AmountColumn { get; set; }
    public int TypeColumn { get; set; }
    public int? CategoryColumn { get; set; }
    public bool HasHeaderRow { get; set; } = true;
}
