using PocketLedger.Domain.Common;

namespace PocketLedger.Domain.Entities;

public class Tag : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#8b5cf6";
    public string UserId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public ICollection<TransactionTag> TransactionTags { get; set; } = new List<TransactionTag>();
}
