using MediatR;

namespace PocketLedger.Application.Features.Reports.Queries.GetReport;

public class GetReportQuery : IRequest<ReportDto>
{
    public string Period { get; set; } = "monthly";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class ReportDto
{
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetIncome => TotalIncome - TotalExpense;
    public double SavingsRate => TotalIncome > 0 ? (double)(NetIncome / TotalIncome) * 100 : 0;
    public string Currency { get; set; } = "USD";
    public List<MonthlyDataDto> MonthlyBreakdown { get; set; } = new();
    public List<CategorySpendingReportDto> CategoryBreakdown { get; set; } = new();
    public List<WalletAnalysisDto> WalletAnalysis { get; set; } = new();
    public List<BudgetAnalysisDto> BudgetAnalysis { get; set; } = new();
    public List<DailyTrendDto> DailyTrend { get; set; } = new();
    public List<WeeklyComparisonDto> WeeklyComparison { get; set; } = new();
    public PreviousPeriodComparisonDto? PreviousPeriod { get; set; }
}

public class PreviousPeriodComparisonDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal NetIncome { get; set; }
    public double SavingsRate { get; set; }
    public double IncomeChangePercent { get; set; }
    public double ExpenseChangePercent { get; set; }
    public double NetChangePercent { get; set; }
}

public class MonthlyDataDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Net => Income - Expense;
}

public class CategorySpendingReportDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public double Percentage { get; set; }
    public int TransactionCount { get; set; }
}

public class WalletAnalysisDto
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetAmount => TotalIncome - TotalExpense;
    public int TransactionCount { get; set; }
}

public class BudgetAnalysisDto
{
    public int BudgetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => BudgetAmount - SpentAmount;
    public double PercentUsed { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
}

public class DailyTrendDto
{
    public DateTime Date { get; set; }
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
}

public class WeeklyComparisonDto
{
    public string Week { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
}
