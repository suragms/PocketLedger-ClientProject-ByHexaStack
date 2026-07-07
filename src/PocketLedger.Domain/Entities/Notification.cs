using PocketLedger.Domain.Common;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class Notification : BaseAuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
    public string? ActionUrl { get; set; }
    public string? Icon { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime? ReadAt { get; set; }
    public DateTime? ArchivedAt { get; set; }

    public User User { get; set; } = null!;
}
