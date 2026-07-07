using PocketLedger.Domain.Common;

namespace PocketLedger.Domain.Entities;

public class UserSettings : BaseEntity
{
    public string UserId { get; set; } = string.Empty;

    // Appearance
    public string Theme { get; set; } = "system"; // light, dark, system
    public string Language { get; set; } = "en";
    public string Currency { get; set; } = "USD";

    // Notifications
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool BudgetAlerts { get; set; } = true;
    public bool WeeklyReport { get; set; } = true;
    public bool MonthlyReport { get; set; } = true;

    // Privacy
    public bool ShowBalance { get; set; } = true;
    public bool ShowTransactions { get; set; } = true;
    public bool PublicProfile { get; set; } = false;

    // Security
    public bool LoginNotifications { get; set; } = true;
    public bool SessionTimeout { get; set; } = false;
    public int SessionTimeoutMinutes { get; set; } = 30;

    // Navigation
    public User User { get; set; } = null!;
}
