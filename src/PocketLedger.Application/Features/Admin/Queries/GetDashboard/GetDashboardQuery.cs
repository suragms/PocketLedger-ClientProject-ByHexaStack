using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetDashboard;

public record GetDashboardQuery : IRequest<DashboardDto>;

public class DashboardDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int NewUsersToday { get; set; }
    public int TotalTransactions { get; set; }
    public decimal TotalVolume { get; set; }
    public int TotalCategories { get; set; }
    public int TotalWallets { get; set; }
    public int TotalBudgets { get; set; }
    public int TotalNotifications { get; set; }
    public int AuditLogCount { get; set; }
    public List<DailyStat> DailyStats { get; set; } = new();
    public List<TopUser> TopUsers { get; set; } = new();
}

public class DailyStat
{
    public string Date { get; set; } = string.Empty;
    public int Users { get; set; }
    public int Transactions { get; set; }
    public decimal Volume { get; set; }
}

public class TopUser
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int TransactionCount { get; set; }
    public decimal TotalVolume { get; set; }
}

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetDashboardQueryHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var today = now.Date;

        var allAccounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);
        var allCategories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var allBudgets = await _unitOfWork.Budgets.GetAllAsync(cancellationToken);

        var allTransactions = await _unitOfWork.Transactions.GetAllAsync(cancellationToken);
        var totalTransactions = allTransactions.Count;
        var totalVolume = allTransactions.Sum(t => t.Amount);

        var totalNotifications = (await _unitOfWork.Notifications.GetByUserIdAsync("", 0, int.MaxValue, cancellationToken)).Count;

        var dailyStats = new List<DailyStat>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            dailyStats.Add(new DailyStat
            {
                Date = date.ToString("MMM dd"),
                Users = users.Count(u => u.CreatedAt.Date == date),
                Transactions = allTransactions.Count(t => t.CreatedAt.Date == date),
                Volume = allTransactions.Where(t => t.CreatedAt.Date == date).Sum(t => t.Amount)
            });
        }

        var userTransactions = allTransactions
            .GroupBy(t => t.UserId)
            .ToDictionary(g => g.Key, g => new { Count = g.Count(), Volume = g.Sum(t => t.Amount) });

        var topUsers = users
            .OrderByDescending(u => userTransactions.ContainsKey(u.Id) ? userTransactions[u.Id].Volume : 0)
            .Take(5)
            .Select(u => new TopUser
            {
                Id = u.Id,
                Email = u.Email ?? "",
                Name = $"{u.FirstName} {u.LastName}",
                TransactionCount = userTransactions.ContainsKey(u.Id) ? userTransactions[u.Id].Count : 0,
                TotalVolume = userTransactions.ContainsKey(u.Id) ? userTransactions[u.Id].Volume : 0
            }).ToList();

        return new DashboardDto
        {
            TotalUsers = users.Count,
            ActiveUsers = users.Count(u => u.IsActive),
            NewUsersToday = users.Count(u => u.CreatedAt.Date == today),
            TotalTransactions = totalTransactions,
            TotalVolume = totalVolume,
            TotalCategories = allCategories?.Count() ?? 0,
            TotalWallets = allAccounts?.Count() ?? 0,
            TotalBudgets = allBudgets?.Count() ?? 0,
            TotalNotifications = totalNotifications,
            AuditLogCount = await _unitOfWork.AuditLogs.GetCountAsync(cancellationToken),
            DailyStats = dailyStats,
            TopUsers = topUsers
        };
    }
}
