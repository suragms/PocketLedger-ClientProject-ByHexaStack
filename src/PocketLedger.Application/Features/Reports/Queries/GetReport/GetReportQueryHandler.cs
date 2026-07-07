using MediatR;
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
        var (startDate, endDate) = ResolveDates(request);

        var totalIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, startDate, endDate, cancellationToken);
        var totalExpense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, startDate, endDate, cancellationToken);

        var currency = "USD";
        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(userId, cancellationToken);
        if (accounts.Count > 0)
            currency = accounts.First().Currency;

        var monthlyBreakdown = await BuildMonthlyBreakdown(userId, startDate, endDate, cancellationToken);
        var categoryBreakdown = await BuildCategoryBreakdown(userId, startDate, endDate, cancellationToken);
        var walletAnalysis = await BuildWalletAnalysis(userId, accounts, startDate, endDate, cancellationToken);
        var budgetAnalysis = await BuildBudgetAnalysis(userId, cancellationToken);
        var dailyTrend = await BuildDailyTrend(userId, startDate, endDate, cancellationToken);
        var weeklyComparison = BuildWeeklyComparison(monthlyBreakdown);

        return new ReportDto
        {
            Period = request.Period,
            StartDate = startDate,
            EndDate = endDate,
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            Currency = currency,
            MonthlyBreakdown = monthlyBreakdown,
            CategoryBreakdown = categoryBreakdown,
            WalletAnalysis = walletAnalysis,
            BudgetAnalysis = budgetAnalysis,
            DailyTrend = dailyTrend,
            WeeklyComparison = weeklyComparison,
        };
    }

    private static (DateTime Start, DateTime End) ResolveDates(GetReportQuery request)
    {
        var end = request.EndDate ?? DateTime.UtcNow;
        var start = request.StartDate ?? request.Period.ToLower() switch
        {
            "weekly" => end.AddDays(-28),
            "monthly" => end.AddMonths(-12),
            "yearly" => end.AddYears(-5),
            _ => end.AddMonths(-12),
        };
        return (start, end);
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

    private async Task<List<BudgetAnalysisDto>> BuildBudgetAnalysis(string userId, CancellationToken ct)
    {
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, ct);

        return budgets.Where(b => b.IsActive).Select(b => new BudgetAnalysisDto
        {
            BudgetId = b.Id,
            Name = b.Name,
            BudgetAmount = b.Amount,
            SpentAmount = 0,
            PercentUsed = 0,
            Status = "On Track",
            CategoryName = b.Category?.Name,
        }).ToList();
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
