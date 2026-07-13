using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.RecurringTransactions.DTOs;

public class RecurringTransactionDto : IMapFrom<RecurringTransaction>
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public string TypeName => Type switch
    {
        TransactionType.Income => "Income",
        TransactionType.Expense => "Expense",
        TransactionType.Transfer => "Transfer",
        _ => "Unknown"
    };
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public int FrequencyDays { get; set; }
    public DateTime NextDueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? AccountColor { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
    public string? CategoryIcon { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
