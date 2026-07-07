using PocketLedger.Domain.Common;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class RecurringTransaction : BaseAuditableEntity
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public int FrequencyDays { get; set; }
    public DateTime NextDueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int AccountId { get; set; }
    public int? CategoryId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public Account Account { get; set; } = null!;
    public Category? Category { get; set; }
    public User User { get; set; } = null!;
}
