using PocketLedger.Domain.Common;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class Transaction : BaseAuditableEntity
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public string? Reference { get; set; }
    public string? ReceiptUrl { get; set; }
    public string? ReceiptThumbnailUrl { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public bool IsRecurring { get; set; }
    public int? RecurringTransactionId { get; set; }
    public int AccountId { get; set; }
    public int? CategoryId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public Account Account { get; set; } = null!;
    public Category? Category { get; set; }
    public User User { get; set; } = null!;
    public ICollection<TransactionTag> TransactionTags { get; set; } = new List<TransactionTag>();
}