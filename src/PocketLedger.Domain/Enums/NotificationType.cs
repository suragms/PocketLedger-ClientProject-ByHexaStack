namespace PocketLedger.Domain.Enums;

public enum NotificationType
{
    DailyReminder = 0,
    WeeklySummary = 1,
    MonthlySummary = 2,
    BudgetAlert = 3,
    BudgetExceeded = 4,
    System = 5,
}

public enum NotificationStatus
{
    Unread = 0,
    Read = 1,
    Archived = 2,
}
