using MediatR;
using PocketLedger.Domain.Common.ValueObjects;
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

        var (currentRange, previousRange, periodLabel) = ResolvePeriods(request, now);

        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(userId, cancellationToken);
        var recentTransactions = await _unitOfWork.Transactions.GetRecentTransactionsAsync(userId, 10, cancellationToken);
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, cancellationToken);

        var totalIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, currentRange.Start, currentRange.End, cancellationToken);
        var totalExpenses = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, currentRange.Start, currentRange.End, cancellationToken);

        var prevIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, previousRange.Start, previousRange.End, cancellationToken);
        var prevExpenses = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, previousRange.Start, previousRange.End, cancellationToken);

        var totalBalance = accounts.Where(a => a.IncludeInBalance).Sum(a => a.Balance);

        var totalTransactions = recentTransactions
            .Count(t => t.Date >= currentRange.Start && t.Date <= currentRange.End);

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

        var periodExpenses = recentTransactions
            .Where(t => t.Type == TransactionType.Expense && t.Date >= currentRange.Start && t.Date <= currentRange.End)
            .GroupBy(t => t.CategoryId)
            .ToDictionary(g => g.Key ?? 0, g => g.Sum(t => t.Amount));

        var totalPeriodSpent = periodExpenses.Values.Sum();

        var budgetProgressList = budgets.Select(b =>
        {
            decimal spentAmount;
            if (b.CategoryId.HasValue)
            {
                periodExpenses.TryGetValue(b.CategoryId.Value, out spentAmount);
            }
            else
            {
                spentAmount = totalPeriodSpent;
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
            .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue && t.Date >= currentRange.Start && t.Date <= currentRange.End)
            .GroupBy(t => new { t.CategoryId, t.Category?.Name, t.Category?.Color })
            .Select(g => new CategorySpendingDto
            {
                CategoryId = g.Key.CategoryId ?? 0,
                CategoryName = g.Key.Name ?? "Uncategorized",
                Color = g.Key.Color ?? "#6b7280",
                Amount = g.Sum(t => t.Amount),
                Percentage = totalExpenses > 0 ? Math.Round(g.Sum(t => t.Amount) / totalExpenses * 100, 1) : 0,
            })
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        var prevNetIncome = prevIncome - prevExpenses;
        var currentNetIncome = totalIncome - totalExpenses;

        var incomeChange = prevIncome > 0 ? Math.Round((double)((totalIncome - prevIncome) / prevIncome) * 100, 1) : 0;
        var expenseChange = prevExpenses > 0 ? Math.Round((double)((totalExpenses - prevExpenses) / prevExpenses) * 100, 1) : 0;
        var netChange = prevNetIncome != 0 ? Math.Round((double)((currentNetIncome - prevNetIncome) / Math.Abs(prevNetIncome)) * 100, 1) : 0;

        var monthlyBreakdown = await BuildMonthlyBreakdown(userId, currentRange, cancellationToken);

        var previousPeriod = new PeriodComparisonDto
        {
            Income = prevIncome,
            Expenses = prevExpenses,
            NetIncome = prevNetIncome,
            SavingsRate = prevIncome > 0 ? (double)(prevNetIncome / prevIncome) * 100 : 0,
            IncomeChangePercent = incomeChange,
            ExpenseChangePercent = expenseChange,
            NetChangePercent = netChange,
            Label = GetPreviousPeriodLabel(request, now),
        };

        return new DashboardSummaryDto
        {
            TotalBalance = totalBalance,
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            TotalAccounts = accounts.Count,
            TotalTransactions = totalTransactions,
            PeriodLabel = GetCurrentPeriodLabel(request, now),
            PeriodStart = currentRange.Start,
            PeriodEnd = currentRange.End,
            Accounts = accountSummaries,
            RecentTransactions = transactionSummaries,
            BudgetProgress = budgetProgressList,
            TopSpendingCategories = spendingByCategory,
            PreviousPeriod = previousPeriod,
            MonthlyBreakdown = monthlyBreakdown,
        };
    }

    private async Task<List<MonthlyDashboardDataDto>> BuildMonthlyBreakdown(
        string userId, DateRange range, CancellationToken ct)
    {
        var result = new List<MonthlyDashboardDataDto>();
        var current = new DateTime(range.Start.Year, range.Start.Month, 1);
        var endMonth = new DateTime(range.End.Year, range.End.Month, 1);

        while (current <= endMonth)
        {
            var monthEnd = current.AddMonths(1).AddDays(-1);
            var income = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Income, current, monthEnd, ct);
            var expense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Expense, current, monthEnd, ct);

            result.Add(new MonthlyDashboardDataDto
            {
                Month = current.ToString("MMM yyyy"),
                Income = income,
                Expense = expense,
            });

            current = current.AddMonths(1);
        }

        return result;
    }

    private static (DateRange Current, DateRange Previous, string Label) ResolvePeriods(GetDashboardSummaryQuery request, DateTime now)
    {
        var period = request.Period?.ToLowerInvariant();
        DateRange current;

        if (period == "custom" && request.CustomStartDate.HasValue && request.CustomEndDate.HasValue)
        {
            current = DateRange.Create(request.CustomStartDate.Value, request.CustomEndDate.Value);
        }
        else
        {
            current = period switch
            {
                "quarter" or "quarterly" => DateRange.Quarter(now),
                "year" or "yearly" => DateRange.Year(now),
                _ => DateRange.Month(now),
            };
        }

        var previous = current.GetPreviousPeriod();
        var label = GetPeriodLabel(current, period);
        return (current, previous, label);
    }

    private static string GetPeriodLabel(DateRange range, string? period)
    {
        return period switch
        {
            "quarter" or "quarterly" => $"Q{((range.Start.Month - 1) / 3) + 1} {range.Start.Year}",
            "year" or "yearly" => range.Start.Year.ToString(),
            _ => range.Start.ToString("MMMM yyyy"),
        };
    }

    private static string GetCurrentPeriodLabel(GetDashboardSummaryQuery request, DateTime now)
    {
        var period = request.Period?.ToLowerInvariant();
        return period switch
        {
            "quarter" or "quarterly" => $"Q{((now.Month - 1) / 3) + 1} {now.Year}",
            "year" or "yearly" => now.Year.ToString(),
            "custom" => "Custom Range",
            _ => now.ToString("MMMM yyyy"),
        };
    }

    private static string GetPreviousPeriodLabel(GetDashboardSummaryQuery request, DateTime now)
    {
        var period = request.Period?.ToLowerInvariant();
        return period switch
        {
            "quarter" or "quarterly" => "Previous Quarter",
            "year" or "yearly" => "Previous Year",
            "custom" => "Previous Period",
            _ => "Last Month",
        };
    }
}
