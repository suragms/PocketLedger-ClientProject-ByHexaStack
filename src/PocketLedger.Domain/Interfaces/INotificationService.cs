using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Interfaces;

public interface INotificationService
{
    Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? actionUrl = null, string? icon = null, CancellationToken ct = default);
    Task SendDailyReminderAsync(string userId, CancellationToken ct = default);
    Task SendWeeklySummaryAsync(string userId, CancellationToken ct = default);
    Task SendMonthlySummaryAsync(string userId, CancellationToken ct = default);
    Task SendBudgetAlertsAsync(string userId, CancellationToken ct = default);
    Task CleanupOldNotificationsAsync(CancellationToken ct = default);
}
