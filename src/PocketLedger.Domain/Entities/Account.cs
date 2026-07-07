using PocketLedger.Domain.Common;
using PocketLedger.Domain.Common.ValueObjects;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class Account : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IncludeInBalance { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string UserId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
