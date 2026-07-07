using MediatR;

namespace PocketLedger.Application.Features.Dashboard.Queries.GetDashboardSummary;

public class GetDashboardSummaryQuery : IRequest<DashboardSummaryDto> { }

public class DashboardSummaryDto
{
    public decimal TotalBalance { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public decimal MonthlyNet => MonthlyIncome - MonthlyExpenses;
    public int TotalAccounts { get; set; }
    public int TotalTransactionsThisMonth { get; set; }
    public List<AccountSummaryDto> Accounts { get; set; } = new();
    public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    public List<BudgetProgressDto> BudgetProgress { get; set; } = new();
    public List<CategorySpendingDto> TopSpendingCategories { get; set; } = new();
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
