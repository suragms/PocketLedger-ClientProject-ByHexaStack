using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public AuditLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLog> AddAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
        return log;
    }

    public async Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, string? search, string? userId, string? action,
        DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs.Include(a => a.User).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(a => a.Action.Contains(search) || a.Entity.Contains(search) || a.User.Email!.Contains(search));
        if (!string.IsNullOrEmpty(userId))
            query = query.Where(a => a.UserId == userId);
        if (!string.IsNullOrEmpty(action))
            query = query.Where(a => a.Action == action);
        if (startDate.HasValue)
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(a => a.CreatedAt <= endDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<List<AuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.AuditLogs
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AuditLogs.CountAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.AuditLogs
            .Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate)
            .CountAsync(cancellationToken);
    }
}
