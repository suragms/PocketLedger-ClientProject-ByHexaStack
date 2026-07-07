using PocketLedger.Domain.Common;

namespace PocketLedger.Domain.Entities;

public class NotificationPreference : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public bool DailyReminderEnabled { get; set; } = true;
    public int DailyReminderHour { get; set; } = 9;
    public bool WeeklySummaryEnabled { get; set; } = true;
    public int WeeklySummaryDay { get; set; } = 1;
    public bool MonthlySummaryEnabled { get; set; } = true;
    public int MonthlySummaryDay { get; set; } = 1;
    public bool BudgetAlertEnabled { get; set; } = true;
    public bool BudgetExceededEnabled { get; set; } = true;
    public bool PushNotificationsEnabled { get; set; } = true;
    public string? PushEndpoint { get; set; }
    public string? PushP256dh { get; set; }
    public string? PushAuth { get; set; }

    public User User { get; set; } = null!;
}
