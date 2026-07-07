using MediatR;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgetAnalytics;

public class GetBudgetAnalyticsQueryHandler : IRequestHandler<GetBudgetAnalyticsQuery, BudgetAnalyticsDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetBudgetAnalyticsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<BudgetAnalyticsDto> Handle(GetBudgetAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var now = DateTime.UtcNow;
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, cancellationToken);

        var activeBudgets = budgets.Where(b => b.IsActive).ToList();
        var totalBudgeted = activeBudgets.Sum(b => b.Amount);
        var currency = activeBudgets.FirstOrDefault()?.Currency ?? "USD";

        decimal totalSpent = 0;
        var overCount = 0;
        var nearCount = 0;
        var onTrackCount = 0;
        var budgetSpending = new List<(Domain.Entities.Budget Budget, decimal Spent)>();

        foreach (var budget in activeBudgets)
        {
            var (startDate, endDate) = GetPeriodRange(budget, now);
            decimal spent;

            if (budget.CategoryId.HasValue)
            {
                spent = await _unitOfWork.Transactions.GetTotalByCategoryAsync(
                    userId, budget.CategoryId.Value, startDate, endDate, cancellationToken);
            }
            else
            {
                spent = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                    userId, TransactionType.Expense, startDate, endDate, cancellationToken);
            }

            budgetSpending.Add((budget, spent));
            totalSpent += spent;
            var percentUsed = budget.Amount > 0 ? (double)(spent / budget.Amount) * 100 : 0;

            if (percentUsed > 100) overCount++;
            else if (budget.AlertThreshold.HasValue && percentUsed >= (double)budget.AlertThreshold.Value) nearCount++;
            else onTrackCount++;
        }

        var periodSummaries = budgetSpending
            .GroupBy(x => x.Budget.Period)
            .Select(g => new BudgetPeriodSummary
            {
                Period = g.Key.ToString(),
                BudgetCount = g.Count(),
                TotalAmount = g.Sum(x => x.Budget.Amount),
                TotalSpent = g.Sum(x => x.Spent),
                PercentUsed = g.Sum(x => x.Budget.Amount) > 0
                    ? (double)(g.Sum(x => x.Spent) / g.Sum(x => x.Budget.Amount)) * 100
                    : 0,
            })
            .ToList();

        var categorySummaries = budgetSpending
            .Where(x => x.Budget.CategoryId.HasValue)
            .GroupBy(x => new { x.Budget.CategoryId, x.Budget.Category?.Name, x.Budget.Category?.Color })
            .Select(g => new CategoryBudgetSummary
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name ?? "Uncategorized",
                Color = g.Key.Color ?? "#6b7280",
                BudgetAmount = g.Sum(x => x.Budget.Amount),
                SpentAmount = g.Sum(x => x.Spent),
            })
            .ToList();

        var last30Days = Enumerable.Range(0, 30)
            .Select(i => now.AddDays(-29 + i).Date)
            .ToList();

        var dailySpending = new List<DailySpendingDto>();
        foreach (var day in last30Days)
        {
            var dayStart = day;
            var dayEnd = day.AddDays(1);
            var dayTotal = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Expense, dayStart, dayEnd, cancellationToken);
            dailySpending.Add(new DailySpendingDto { Date = day, Amount = dayTotal });
        }

        return new BudgetAnalyticsDto
        {
            TotalBudgeted = totalBudgeted,
            TotalSpent = totalSpent,
            ActiveBudgets = activeBudgets.Count,
            OverBudgetCount = overCount,
            NearLimitCount = nearCount,
            OnTrackCount = onTrackCount,
            Currency = currency,
            PeriodSummaries = periodSummaries,
            CategorySummaries = categorySummaries,
            DailySpending = dailySpending,
        };
    }

    private static (DateTime Start, DateTime End) GetPeriodRange(Domain.Entities.Budget budget, DateTime now)
    {
        return budget.Period switch
        {
            BudgetPeriod.Weekly => (now.AddDays(-7), now),
            BudgetPeriod.Monthly => (new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc), now),
            BudgetPeriod.Quarterly => (new DateTime(now.Year, ((now.Month - 1) / 3) * 3 + 1, 1, 0, 0, 0, DateTimeKind.Utc), now),
            BudgetPeriod.Yearly => (new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc), now),
            _ => (budget.StartDate, budget.EndDate ?? now),
        };
    }
}
