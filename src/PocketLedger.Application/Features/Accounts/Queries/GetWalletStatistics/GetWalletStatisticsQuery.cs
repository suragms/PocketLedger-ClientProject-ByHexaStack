using MediatR;

namespace PocketLedger.Application.Features.Accounts.Queries.GetWalletStatistics;

public class GetWalletStatisticsQuery : IRequest<WalletStatisticsDto>
{
    public int AccountId { get; set; }
}

public class WalletStatisticsDto
{
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public int TotalTransactions { get; set; }
    public int TotalIncome { get; set; }
    public int TotalExpenses { get; set; }
    public decimal IncomeAmount { get; set; }
    public decimal ExpenseAmount { get; set; }
    public decimal NetAmount => IncomeAmount - ExpenseAmount;
    public decimal AverageTransactionAmount { get; set; }
    public decimal HighestExpense { get; set; }
    public decimal HighestIncome { get; set; }
    public DateTime? LastTransactionDate { get; set; }
    public DateTime? FirstTransactionDate { get; set; }
    public List<MonthlyBreakdownDto> MonthlyBreakdown { get; set; } = new();
    public List<CategoryBreakdownDto> TopCategories { get; set; } = new();
}

public class MonthlyBreakdownDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Net => Income - Expense;
}

public class CategoryBreakdownDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = "#6b7280";
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
    public int TransactionCount { get; set; }
}
