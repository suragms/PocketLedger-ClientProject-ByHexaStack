using MediatR;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAnalytics;

public record GetAnalyticsQuery : IRequest<AnalyticsDto>
{
    public string? Period { get; init; } = "monthly";
}

public class AnalyticsDto
{
    public UserGrowthDto UserGrowth { get; set; } = new();
    public TransactionAnalyticsDto TransactionAnalytics { get; set; } = new();
    public RevenueDto Revenue { get; set; } = new();
    public SystemHealthDto SystemHealth { get; set; } = new();
}

public class UserGrowthDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public double GrowthRate { get; set; }
    public List<MonthlyDataPoint> MonthlyGrowth { get; set; } = new();
}

public class TransactionAnalyticsDto
{
    public int TotalTransactions { get; set; }
    public decimal TotalVolume { get; set; }
    public double AverageTransaction { get; set; }
    public List<MonthlyDataPoint> MonthlyVolume { get; set; } = new();
}

public class RevenueDto
{
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public double GrowthRate { get; set; }
}

public class SystemHealthDto
{
    public int TotalAccounts { get; set; }
    public int TotalCategories { get; set; }
    public int TotalBudgets { get; set; }
    public int ActiveNotifications { get; set; }
    public double Uptime { get; set; }
}

public class MonthlyDataPoint
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public int Count { get; set; }
}

public class GetAnalyticsQueryHandler : IRequestHandler<GetAnalyticsQuery, AnalyticsDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetAnalyticsQueryHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AnalyticsDto> Handle(GetAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var accounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var budgets = await _unitOfWork.Budgets.GetAllAsync(cancellationToken);

        var allTransactions = await _unitOfWork.Transactions.GetAllAsync(cancellationToken);
        var totalTransactions = allTransactions.Count;
        var totalVolume = allTransactions.Sum(t => t.Amount);
        var averageTransaction = totalTransactions > 0 ? (double)(totalVolume / totalTransactions) : 0;

        var activeNotifications = (await _unitOfWork.Notifications.GetByUserIdAsync("", 0, int.MaxValue, cancellationToken)).Count;

        var now = DateTime.UtcNow;
        var monthlyGrowth = new List<MonthlyDataPoint>();
        var monthlyVolume = new List<MonthlyDataPoint>();
        for (int i = 5; i >= 0; i--)
        {
            var month = now.AddMonths(-i);
            var count = users.Count(u => u.CreatedAt.Month == month.Month && u.CreatedAt.Year == month.Year);
            monthlyGrowth.Add(new MonthlyDataPoint { Label = month.ToString("MMM yyyy"), Count = count });

            var monthTransactions = allTransactions.Where(t => t.CreatedAt.Month == month.Month && t.CreatedAt.Year == month.Year);
            var monthVolume = monthTransactions.Sum(t => t.Amount);
            monthlyVolume.Add(new MonthlyDataPoint { Label = month.ToString("MMM yyyy"), Value = monthVolume, Count = monthTransactions.Count() });
        }

        var activeCount = users.Count(u => u.IsActive);
        var previousMonthUsers = users.Count(u => u.CreatedAt < now.AddMonths(-1));
        var currentMonthUsers = users.Count(u => u.CreatedAt >= now.AddMonths(-1));
        var growthRate = previousMonthUsers > 0 ? (double)currentMonthUsers / previousMonthUsers * 100 : 0;

        var previousMonthTransactions = allTransactions.Where(t => t.CreatedAt < now.AddMonths(-1));
        var currentMonthTransactions = allTransactions.Where(t => t.CreatedAt >= now.AddMonths(-1));
        var previousMonthRevenue = previousMonthTransactions.Sum(t => t.Amount);
        var currentMonthRevenue = currentMonthTransactions.Sum(t => t.Amount);
        var revenueGrowthRate = previousMonthRevenue > 0 ? (double)(currentMonthRevenue / previousMonthRevenue) * 100 : 0;

        return new AnalyticsDto
        {
            UserGrowth = new UserGrowthDto
            {
                TotalUsers = users.Count,
                ActiveUsers = activeCount,
                GrowthRate = Math.Round(growthRate, 1),
                MonthlyGrowth = monthlyGrowth
            },
            TransactionAnalytics = new TransactionAnalyticsDto
            {
                TotalTransactions = totalTransactions,
                TotalVolume = totalVolume,
                AverageTransaction = Math.Round(averageTransaction, 2),
                MonthlyVolume = monthlyVolume
            },
            Revenue = new RevenueDto
            {
                TotalRevenue = totalVolume,
                MonthlyRevenue = currentMonthRevenue,
                GrowthRate = Math.Round(revenueGrowthRate, 1)
            },
            SystemHealth = new SystemHealthDto
            {
                TotalAccounts = accounts?.Count() ?? 0,
                TotalCategories = categories?.Count() ?? 0,
                TotalBudgets = budgets?.Count() ?? 0,
                ActiveNotifications = activeNotifications,
                Uptime = 99.9
            }
        };
    }
}
