using MediatR;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Dashboard.Queries.GetDashboardSummary;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetDashboardSummaryQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(userId, cancellationToken);
        var recentTransactions = await _unitOfWork.Transactions.GetRecentTransactionsAsync(userId, 10, cancellationToken);
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, cancellationToken);

        var monthlyIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, monthStart, monthEnd, cancellationToken);
        var monthlyExpenses = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, monthStart, monthEnd, cancellationToken);

        var totalBalance = accounts.Where(a => a.IncludeInBalance).Sum(a => a.Balance);

        var accountSummaries = accounts.Select(a => new AccountSummaryDto
        {
            Id = a.Id,
            Name = a.Name,
            Balance = a.Balance,
            Currency = a.Currency,
            Color = a.Color,
            Type = (int)a.Type,
            TypeName = a.Type.ToString(),
        }).ToList();

        var transactionSummaries = recentTransactions.Select(t => new RecentTransactionDto
        {
            Id = t.Id,
            Amount = t.Amount,
            Currency = t.Currency,
            Type = (int)t.Type,
            TypeName = t.Type.ToString(),
            Date = t.Date,
            Payee = t.Payee,
            Note = t.Note,
            AccountName = t.Account?.Name ?? "Unknown",
            CategoryName = t.Category?.Name,
            CategoryColor = t.Category?.Color,
        }).ToList();

        var monthlyCategoryExpenses = recentTransactions
            .Where(t => t.Type == TransactionType.Expense && t.Date >= monthStart && t.Date <= monthEnd)
            .GroupBy(t => t.CategoryId)
            .ToDictionary(g => g.Key ?? 0, g => g.Sum(t => t.Amount));

        var totalMonthlySpent = monthlyCategoryExpenses.Values.Sum();

        var budgetProgressList = budgets.Select(b =>
        {
            decimal spentAmount;
            if (b.CategoryId.HasValue)
            {
                monthlyCategoryExpenses.TryGetValue(b.CategoryId.Value, out spentAmount);
            }
            else
            {
                spentAmount = totalMonthlySpent;
            }

            var percentUsed = b.Amount > 0 ? Math.Round((spentAmount / b.Amount) * 100, 1) : 0;
            return new BudgetProgressDto
            {
                Id = b.Id,
                Name = b.Name,
                Amount = b.Amount,
                SpentAmount = spentAmount,
                RemainingAmount = Math.Max(0, b.Amount - spentAmount),
                PercentUsed = percentUsed,
                CategoryName = b.Category?.Name,
                IsOverBudget = spentAmount > b.Amount,
            };
        }).ToList();

        var spendingByCategory = recentTransactions
            .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue)
            .GroupBy(t => new { t.CategoryId, t.Category?.Name, t.Category?.Color })
            .Select(g => new CategorySpendingDto
            {
                CategoryId = g.Key.CategoryId ?? 0,
                CategoryName = g.Key.Name ?? "Uncategorized",
                Color = g.Key.Color ?? "#6b7280",
                Amount = g.Sum(t => t.Amount),
                Percentage = monthlyExpenses > 0 ? Math.Round(g.Sum(t => t.Amount) / monthlyExpenses * 100, 1) : 0,
            })
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        return new DashboardSummaryDto
        {
            TotalBalance = totalBalance,
            MonthlyIncome = monthlyIncome,
            MonthlyExpenses = monthlyExpenses,
            TotalAccounts = accounts.Count,
            TotalTransactionsThisMonth = recentTransactions.Count(t => t.Date >= monthStart && t.Date <= monthEnd),
            Accounts = accountSummaries,
            RecentTransactions = transactionSummaries,
            BudgetProgress = budgetProgressList,
            TopSpendingCategories = spendingByCategory,
        };
    }
}
