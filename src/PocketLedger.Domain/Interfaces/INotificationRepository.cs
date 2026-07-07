using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IReadOnlyList<Notification>> GetByUserIdAsync(string userId, int skip, int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Notification>> GetByStatusAsync(string userId, NotificationStatus status, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(string userId, CancellationToken cancellationToken = default);
    Task<NotificationPreference?> GetPreferenceAsync(string userId, CancellationToken cancellationToken = default);
    Task CreatePreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
    Task UpdatePreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(int id, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default);
    Task ArchiveAsync(int id, CancellationToken cancellationToken = default);
    Task DeleteOldNotificationsAsync(string userId, int daysOld, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetPagedForAdminAsync(string? userId, int? type, int page, int pageSize, CancellationToken cancellationToken = default);
}
