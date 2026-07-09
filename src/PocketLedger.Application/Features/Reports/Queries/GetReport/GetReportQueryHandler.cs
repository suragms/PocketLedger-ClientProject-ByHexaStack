using MediatR;
using PocketLedger.Domain.Common.ValueObjects;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Reports.Queries.GetReport;

public class GetReportQueryHandler : IRequestHandler<GetReportQuery, ReportDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetReportQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ReportDto> Handle(GetReportQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var now = DateTime.UtcNow;

        var (currentRange, previousRange) = ResolvePeriods(request, now);

        var totalIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, currentRange.Start, currentRange.End, cancellationToken);
        var totalExpense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, currentRange.Start, currentRange.End, cancellationToken);

        var prevIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, previousRange.Start, previousRange.End, cancellationToken);
        var prevExpense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, previousRange.Start, previousRange.End, cancellationToken);

        var currency = "USD";
        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(userId, cancellationToken);
        if (accounts.Count > 0)
            currency = accounts.First().Currency;

        var monthlyBreakdown = await BuildMonthlyBreakdown(userId, currentRange.Start, currentRange.End, cancellationToken);
        var categoryBreakdown = await BuildCategoryBreakdown(userId, currentRange.Start, currentRange.End, cancellationToken);
        var walletAnalysis = await BuildWalletAnalysis(userId, accounts, currentRange.Start, currentRange.End, cancellationToken);
        var budgetAnalysis = await BuildBudgetAnalysis(userId, currentRange.Start, currentRange.End, cancellationToken);
        var dailyTrend = await BuildDailyTrend(userId, currentRange.Start, currentRange.End, cancellationToken);
        var weeklyComparison = BuildWeeklyComparison(monthlyBreakdown);

        var prevNetIncome = prevIncome - prevExpense;
        var currentNetIncome = totalIncome - totalExpense;

        var previousPeriod = new PreviousPeriodComparisonDto
        {
            Label = GetPreviousPeriodLabel(request, now),
            Income = prevIncome,
            Expense = prevExpense,
            NetIncome = prevNetIncome,
            SavingsRate = prevIncome > 0 ? (double)(prevNetIncome / prevIncome) * 100 : 0,
            IncomeChangePercent = prevIncome > 0 ? Math.Round((double)((totalIncome - prevIncome) / prevIncome) * 100, 1) : 0,
            ExpenseChangePercent = prevExpense > 0 ? Math.Round((double)((totalExpense - prevExpense) / prevExpense) * 100, 1) : 0,
            NetChangePercent = prevNetIncome != 0 ? Math.Round((double)((currentNetIncome - prevNetIncome) / Math.Abs(prevNetIncome)) * 100, 1) : 0,
        };

        return new ReportDto
        {
            Period = request.Period,
            StartDate = currentRange.Start,
            EndDate = currentRange.End,
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            Currency = currency,
            MonthlyBreakdown = monthlyBreakdown,
            CategoryBreakdown = categoryBreakdown,
            WalletAnalysis = walletAnalysis,
            BudgetAnalysis = budgetAnalysis,
            DailyTrend = dailyTrend,
            WeeklyComparison = weeklyComparison,
            PreviousPeriod = previousPeriod,
        };
    }

    private static (DateRange Current, DateRange Previous) ResolvePeriods(GetReportQuery request, DateTime now)
    {
        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            var current = DateRange.Create(request.StartDate.Value, request.EndDate.Value);
            var duration = current.End - current.Start;
            var prevEnd = current.Start.AddDays(-1);
            var prevStart = prevEnd.AddDays(-duration.TotalDays);
            return (current, DateRange.Create(prevStart, prevEnd));
        }

        var period = request.Period.ToLowerInvariant();
        var end = now;
        DateRange cur = period switch
        {
            "weekly" => DateRange.Last30Days(end),
            "monthly" => DateRange.Create(end.AddMonths(-12), end),
            "yearly" => DateRange.Create(end.AddYears(-5), end),
            _ => DateRange.Create(end.AddMonths(-12), end),
        };
        return (cur, GetMultiMonthPreviousPeriod(cur));
    }

    private static DateRange GetMultiMonthPreviousPeriod(DateRange current)
    {
        var duration = current.End - current.Start;
        var prevEnd = current.Start.AddDays(-1);
        var prevStart = prevEnd.AddDays(-duration.TotalDays);
        return DateRange.Create(prevStart, prevEnd);
    }

    private static string GetPreviousPeriodLabel(GetReportQuery request, DateTime now)
    {
        if (request.StartDate.HasValue && request.EndDate.HasValue)
            return "Previous Period";

        return request.Period.ToLowerInvariant() switch
        {
            "weekly" => "Previous Month",
            "monthly" => "Previous 12 Months",
            "yearly" => "Previous 5 Years",
            _ => "Previous Period",
        };
    }

    private async Task<List<MonthlyDataDto>> BuildMonthlyBreakdown(
        string userId, DateTime start, DateTime end, CancellationToken ct)
    {
        var result = new List<MonthlyDataDto>();
        var current = new DateTime(start.Year, start.Month, 1);

        while (current <= end)
        {
            var monthEnd = current.AddMonths(1).AddDays(-1);
            var income = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Income, current, monthEnd, ct);
            var expense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Expense, current, monthEnd, ct);

            result.Add(new MonthlyDataDto
            {
                Month = current.ToString("MMM yyyy"),
                Income = income,
                Expense = expense
            });

            current = current.AddMonths(1);
        }

        return result;
    }

    private async Task<List<CategorySpendingReportDto>> BuildCategoryBreakdown(
        string userId, DateTime start, DateTime end, CancellationToken ct)
    {
        var spendingByCategory = await _unitOfWork.Transactions.GetSpendingByCategoryAsync(
            userId, start, end, ct);

        var totalSpending = spendingByCategory.Values.Sum();
        var categories = await _unitOfWork.Categories.GetAllAsync(ct);

        return spendingByCategory.Select(kvp => new CategorySpendingReportDto
        {
            CategoryId = categories.FirstOrDefault(c => c.Name == kvp.Key)?.Id ?? 0,
            CategoryName = kvp.Key,
            Color = categories.FirstOrDefault(c => c.Name == kvp.Key)?.Color ?? "#6b7280",
            Amount = kvp.Value,
            Percentage = totalSpending > 0 ? (double)(kvp.Value / totalSpending) * 100 : 0,
            TransactionCount = 0,
        }).OrderByDescending(x => x.Amount).ToList();
    }

    private async Task<List<WalletAnalysisDto>> BuildWalletAnalysis(
        string userId, IReadOnlyList<Domain.Entities.Account> accounts,
        DateTime start, DateTime end, CancellationToken ct)
    {
        var result = new List<WalletAnalysisDto>();

        foreach (var account in accounts)
        {
            var income = await _unitOfWork.Transactions.GetTotalByTypeForAccountAsync(
                userId, account.Id, TransactionType.Income, start, end, ct);
            var expense = await _unitOfWork.Transactions.GetTotalByTypeForAccountAsync(
                userId, account.Id, TransactionType.Expense, start, end, ct);

            result.Add(new WalletAnalysisDto
            {
                AccountId = account.Id,
                AccountName = account.Name,
                Color = account.Color,
                TypeName = account.Type.ToString(),
                Balance = account.Balance,
                TotalIncome = income,
                TotalExpense = expense,
                TransactionCount = 0,
            });
        }

        return result.OrderByDescending(w => w.Balance).ToList();
    }

    private async Task<List<BudgetAnalysisDto>> BuildBudgetAnalysis(
        string userId, DateTime start, DateTime end, CancellationToken ct)
    {
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, ct);

        var result = new List<BudgetAnalysisDto>();
        foreach (var b in budgets.Where(b => b.IsActive))
        {
            decimal spentAmount = 0;

            if (b.CategoryId.HasValue)
            {
                spentAmount = await _unitOfWork.Transactions.GetTotalByCategoryAsync(
                    userId, b.CategoryId.Value, start, end, ct);
            }
            else
            {
                var allExpenses = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                    userId, TransactionType.Expense, start, end, ct);
                spentAmount = allExpenses;
            }

            var percentUsed = b.Amount > 0 ? Math.Round((double)(spentAmount / b.Amount) * 100, 1) : 0;
            var isOver = spentAmount > b.Amount;

            result.Add(new BudgetAnalysisDto
            {
                BudgetId = b.Id,
                Name = b.Name,
                BudgetAmount = b.Amount,
                SpentAmount = spentAmount,
                PercentUsed = percentUsed,
                Status = isOver ? "Over Budget" : percentUsed >= 80 ? "Near Limit" : "On Track",
                CategoryName = b.Category?.Name,
            });
        }

        return result;
    }

    private async Task<List<DailyTrendDto>> BuildDailyTrend(
        string userId, DateTime start, DateTime end, CancellationToken ct)
    {
        var result = new List<DailyTrendDto>();
        var current = start.Date;

        while (current <= end.Date)
        {
            var dayEnd = current.AddDays(1);
            var income = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Income, current, dayEnd, ct);
            var expense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Expense, current, dayEnd, ct);

            result.Add(new DailyTrendDto
            {
                Date = current,
                Income = income,
                Expense = expense,
            });

            current = current.AddDays(1);
        }

        return result;
    }

    private static List<WeeklyComparisonDto> BuildWeeklyComparison(List<MonthlyDataDto> monthly)
    {
        var result = new List<WeeklyComparisonDto>();
        var weekly = monthly.Chunk(4);

        foreach (var chunk in weekly)
        {
            result.Add(new WeeklyComparisonDto
            {
                Week = $"Q{result.Count + 1}",
                Income = chunk.Sum(m => m.Income),
                Expense = chunk.Sum(m => m.Expense),
            });
        }

        return result;
    }
}
