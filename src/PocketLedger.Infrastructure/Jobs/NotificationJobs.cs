using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Services;

namespace PocketLedger.Infrastructure.Jobs;

public class NotificationJobs
{
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationJobs(INotificationService notificationService, IUnitOfWork unitOfWork)
    {
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task SendDailyReminders(CancellationToken ct = default)
    {
        var users = await GetAllActiveUserIds(ct);
        foreach (var userId in users)
        {
            try
            {
                await _notificationService.SendDailyReminderAsync(userId, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send daily reminder to {userId}: {ex.Message}");
            }
        }
    }

    public async Task SendWeeklySummaries(CancellationToken ct = default)
    {
        var users = await GetAllActiveUserIds(ct);
        foreach (var userId in users)
        {
            try
            {
                await _notificationService.SendWeeklySummaryAsync(userId, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send weekly summary to {userId}: {ex.Message}");
            }
        }
    }

    public async Task SendMonthlySummaries(CancellationToken ct = default)
    {
        var users = await GetAllActiveUserIds(ct);
        foreach (var userId in users)
        {
            try
            {
                await _notificationService.SendMonthlySummaryAsync(userId, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send monthly summary to {userId}: {ex.Message}");
            }
        }
    }

    public async Task CheckBudgetAlerts(CancellationToken ct = default)
    {
        var users = await GetAllActiveUserIds(ct);
        foreach (var userId in users)
        {
            try
            {
                await _notificationService.SendBudgetAlertsAsync(userId, ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to check budget alerts for {userId}: {ex.Message}");
            }
        }
    }

    public async Task CleanupOldNotifications(CancellationToken ct = default)
    {
        try
        {
            await _notificationService.CleanupOldNotificationsAsync(ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to cleanup notifications: {ex.Message}");
        }
    }

    private async Task<List<string>> GetAllActiveUserIds(CancellationToken ct)
    {
        return await _unitOfWork.Transactions.GetAllAsync(ct)
            .ContinueWith(t => t.Result.Select(t => t.UserId).Distinct().ToList(), ct);
    }
}
