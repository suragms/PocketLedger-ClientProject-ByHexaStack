using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace PocketLedger.Infrastructure.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    private readonly ApplicationDbContext _dbContext;

    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
        _dbContext = context;
    }

    public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(string userId, int skip, int take, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(n => n.UserId == userId && n.Status != NotificationStatus.Archived)
            .OrderByDescending(n => n.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetByStatusAsync(string userId, NotificationStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(n => n.UserId == userId && n.Status == status)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .CountAsync(n => n.UserId == userId && n.Status == NotificationStatus.Unread, cancellationToken);
    }

    public async Task<int> GetTotalCountAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .CountAsync(n => n.UserId == userId && n.Status != NotificationStatus.Archived, cancellationToken);
    }

    public async Task<NotificationPreference?> GetPreferenceAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task CreatePreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        await _dbContext.NotificationPreferences.AddAsync(preference, cancellationToken);
    }

    public async Task UpdatePreferenceAsync(NotificationPreference preference, CancellationToken cancellationToken = default)
    {
        _dbContext.NotificationPreferences.Update(preference);
        await Task.CompletedTask;
    }

    public async Task MarkAsReadAsync(int id, CancellationToken cancellationToken = default)
    {
        var notification = await _dbSet.FindAsync(new object[] { id }, cancellationToken);
        if (notification != null && notification.Status == NotificationStatus.Unread)
        {
            notification.Status = NotificationStatus.Read;
            notification.ReadAt = DateTime.UtcNow;
            _dbSet.Update(notification);
        }
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        var unread = await _dbSet
            .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
            .ToListAsync(cancellationToken);

        foreach (var n in unread)
        {
            n.Status = NotificationStatus.Read;
            n.ReadAt = DateTime.UtcNow;
        }
        _dbSet.UpdateRange(unread);
    }

    public async Task ArchiveAsync(int id, CancellationToken cancellationToken = default)
    {
        var notification = await _dbSet.FindAsync(new object[] { id }, cancellationToken);
        if (notification != null)
        {
            notification.Status = NotificationStatus.Archived;
            notification.ArchivedAt = DateTime.UtcNow;
            _dbSet.Update(notification);
        }
    }

    public async Task DeleteOldNotificationsAsync(string userId, int daysOld, CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.UtcNow.AddDays(-daysOld);
        var old = await _dbSet
            .Where(n => n.UserId == userId && n.CreatedAt < cutoff)
            .ToListAsync(cancellationToken);
        _dbSet.RemoveRange(old);
    }

    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetPagedForAdminAsync(string? userId, int? type, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Notification> query = _dbSet.AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(n => n.UserId == userId);
        if (type.HasValue)
            query = query.Where(n => n.Type == (NotificationType)type.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var paged = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (paged, totalCount);
    }
}
