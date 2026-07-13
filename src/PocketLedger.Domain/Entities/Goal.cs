using PocketLedger.Domain.Common;

namespace PocketLedger.Domain.Entities;

public class Goal : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int? LinkedAccountId { get; set; }
    public bool IsArchived { get; set; }
    public string UserId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Account? LinkedAccount { get; set; }
}
