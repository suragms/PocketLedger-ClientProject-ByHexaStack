using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;

namespace PocketLedger.Application.Features.Budgets.DTOs;

public class BudgetDto : IMapFrom<Budget>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public BudgetPeriod Period { get; set; }
    public string PeriodName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? AlertThreshold { get; set; }
    public bool IsActive { get; set; }
    public bool NotifyOnAlert { get; set; }
    public bool NotifyOnExceed { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => Amount - SpentAmount;
    public double PercentUsed => Amount > 0 ? (double)(SpentAmount / Amount) * 100 : 0;
    public bool IsOverBudget => SpentAmount > Amount;
    public bool IsNearLimit => AlertThreshold.HasValue && PercentUsed >= (double)AlertThreshold.Value;
    public string Status => IsOverBudget ? "Over Budget" : IsNearLimit ? "Near Limit" : "On Track";
    public DateTime CreatedAt { get; set; }
}
