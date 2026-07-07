using PocketLedger.Domain.Common;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class Budget : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? AlertThreshold { get; set; }
    public bool IsActive { get; set; } = true;
    public bool NotifyOnAlert { get; set; } = true;
    public bool NotifyOnExceed { get; set; } = true;
    public int? CategoryId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Category? Category { get; set; }
}
