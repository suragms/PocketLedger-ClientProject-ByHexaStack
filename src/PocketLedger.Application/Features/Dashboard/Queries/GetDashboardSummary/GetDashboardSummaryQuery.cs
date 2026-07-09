using MediatR;

namespace PocketLedger.Application.Features.Dashboard.Queries.GetDashboardSummary;

public class GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>
{
    public string? Period { get; set; }
    public DateTime? CustomStartDate { get; set; }
    public DateTime? CustomEndDate { get; set; }
}

public class DashboardSummaryDto
{
    public decimal TotalBalance { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome => TotalIncome - TotalExpenses;
    public double SavingsRate => TotalIncome > 0 ? (double)(NetIncome / TotalIncome) * 100 : 0;
    public int TotalAccounts { get; set; }
    public int TotalTransactions { get; set; }
    public string PeriodLabel { get; set; } = string.Empty;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public List<AccountSummaryDto> Accounts { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public List<BudgetProgressDto> BudgetProgress { get; set; } = new();
    public List<CategorySpendingDto> TopSpendingCategories { get; set; } = new();
    public PeriodComparisonDto? PreviousPeriod { get; set; }
    public List<MonthlyDashboardDataDto> MonthlyBreakdown { get; set; } = new();
}

public class MonthlyDashboardDataDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
}

public class PeriodComparisonDto
{
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetIncome { get; set; }
    public double SavingsRate { get; set; }
    public double IncomeChangePercent { get; set; }
    public double ExpenseChangePercent { get; set; }
    public double NetChangePercent { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class AccountSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Color { get; set; }
    public int Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
}

public class RecentTransactionDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public int Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Payee { get; set; }
    public string? Note { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
}

public class BudgetProgressDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal PercentUsed { get; set; }
    public string? CategoryName { get; set; }
    public bool IsOverBudget { get; set; }
}

public class CategorySpendingDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}
