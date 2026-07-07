using MediatR;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgetAnalytics;

public class GetBudgetAnalyticsQuery : IRequest<BudgetAnalyticsDto> { }

public class BudgetAnalyticsDto
{
    public decimal TotalBudgeted { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining => TotalBudgeted - TotalSpent;
    public double OverallPercentUsed => TotalBudgeted > 0 ? (double)(TotalSpent / TotalBudgeted) * 100 : 0;
    public int ActiveBudgets { get; set; }
    public int OverBudgetCount { get; set; }
    public int NearLimitCount { get; set; }
    public int OnTrackCount { get; set; }
    public string Currency { get; set; } = "USD";
    public List<BudgetPeriodSummary> PeriodSummaries { get; set; } = new();
    public List<CategoryBudgetSummary> CategorySummaries { get; set; } = new();
    public List<DailySpendingDto> DailySpending { get; set; } = new();
}

public class BudgetPeriodSummary
{
    public string Period { get; set; } = string.Empty;
    public int BudgetCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public double PercentUsed { get; set; }
}

public class CategoryBudgetSummary
{
    public int? CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = "#6b7280";
    public decimal BudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public double PercentUsed { get; set; }
}

public class DailySpendingDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
}
