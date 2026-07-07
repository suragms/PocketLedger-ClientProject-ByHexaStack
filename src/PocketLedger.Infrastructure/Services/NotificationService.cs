using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace PocketLedger.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationRepository _notificationRepo;
    private readonly ApplicationDbContext _context;

    public NotificationService(IUnitOfWork unitOfWork, INotificationRepository notificationRepo, ApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _notificationRepo = notificationRepo;
        _context = context;
    }

    public async Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? actionUrl = null, string? icon = null, CancellationToken ct = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ActionUrl = actionUrl,
            Icon = icon,
            Status = NotificationStatus.Unread,
            CreatedAt = DateTime.UtcNow,
        };

        await _notificationRepo.AddAsync(notification, ct);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task SendDailyReminderAsync(string userId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var todayExpenses = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, today, today.AddDays(1), ct);
        var todayIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, today, today.AddDays(1), ct);

        if (todayExpenses == 0 && todayIncome == 0) return;

        var message = $"Today: +${todayIncome:N2} income, -${todayExpenses:N2} expenses. Net: ${(todayIncome - todayExpenses):N2}";
        await CreateNotificationAsync(userId, "Daily Summary", message, NotificationType.DailyReminder, "/transactions", "calendar", ct);
    }

    public async Task SendWeeklySummaryAsync(string userId, CancellationToken ct = default)
    {
        var end = DateTime.UtcNow;
        var start = end.AddDays(-7);

        var income = await _unitOfWork.Transactions.GetTotalByTypeAsync(userId, TransactionType.Income, start, end, ct);
        var expense = await _unitOfWork.Transactions.GetTotalByTypeAsync(userId, TransactionType.Expense, start, end, ct);
        var net = income - expense;

        var message = $"This week: +${income:N2} income, -${expense:N2} expenses. Net: ${net:N2}";
        await CreateNotificationAsync(userId, "Weekly Summary", message, NotificationType.WeeklySummary, "/reports", "chart-bar", ct);
    }

    public async Task SendMonthlySummaryAsync(string userId, CancellationToken ct = default)
    {
        var end = DateTime.UtcNow;
        var start = new DateTime(end.Year, end.Month, 1);

        var income = await _unitOfWork.Transactions.GetTotalByTypeAsync(userId, TransactionType.Income, start, end, ct);
        var expense = await _unitOfWork.Transactions.GetTotalByTypeAsync(userId, TransactionType.Expense, start, end, ct);
        var net = income - expense;

        var message = $"This month: +${income:N2} income, -${expense:N2} expenses. Net: ${net:N2}";
        await CreateNotificationAsync(userId, "Monthly Summary", message, NotificationType.MonthlySummary, "/reports", "calendar-days", ct);
    }

    public async Task SendBudgetAlertsAsync(string userId, CancellationToken ct = default)
    {
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, ct);

        foreach (var budget in budgets.Where(b => b.IsActive))
        {
            var now = DateTime.UtcNow;
            var (start, end) = budget.Period switch
            {
                BudgetPeriod.Weekly => (now.AddDays(-7), now),
                BudgetPeriod.Monthly => (new DateTime(now.Year, now.Month, 1), now),
                BudgetPeriod.Quarterly => (new DateTime(now.Year, ((now.Month - 1) / 3) * 3 + 1, 1), now),
                BudgetPeriod.Yearly => (new DateTime(now.Year, 1, 1), now),
                _ => (budget.StartDate, budget.EndDate ?? now),
            };

            decimal spent;
            if (budget.CategoryId.HasValue)
            {
                spent = await _unitOfWork.Transactions.GetTotalByCategoryAsync(
                    userId, budget.CategoryId.Value, start, end, ct);
            }
            else
            {
                spent = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                    userId, TransactionType.Expense, start, end, ct);
            }

            var percentUsed = budget.Amount > 0 ? (double)(spent / budget.Amount) * 100 : 0;

            if (budget.NotifyOnExceed && percentUsed >= 100)
            {
                await CreateNotificationAsync(userId,
                    $"Budget Exceeded: {budget.Name}",
                    $"You've exceeded your {budget.Name} budget by ${(spent - budget.Amount):N2}.",
                    NotificationType.BudgetExceeded,
                    $"/budgets/{budget.Id}",
                    "exclamation-triangle",
                    ct);
            }
            else if (budget.NotifyOnAlert && budget.AlertThreshold.HasValue && percentUsed >= (double)budget.AlertThreshold.Value)
            {
                await CreateNotificationAsync(userId,
                    $"Budget Alert: {budget.Name}",
                    $"Your {budget.Name} budget is at {percentUsed:F0}% (${spent:N2} / ${budget.Amount:N2}).",
                    NotificationType.BudgetAlert,
                    $"/budgets/{budget.Id}",
                    "bell",
                    ct);
            }
        }
    }

    public async Task CleanupOldNotificationsAsync(CancellationToken ct = default)
    {
        var preferences = await _context.NotificationPreferences
            .Where(p => p.PushNotificationsEnabled)
            .Select(p => p.UserId)
            .Distinct()
            .ToListAsync(ct);

        foreach (var userId in preferences)
        {
            await _notificationRepo.DeleteOldNotificationsAsync(userId, 90, ct);
        }
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
