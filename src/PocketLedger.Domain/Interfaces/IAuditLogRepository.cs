using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IAuditLogRepository
{
    Task<AuditLog> AddAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, string? userId, string? action, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default);
    Task<List<AuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<int> GetCountAsync(CancellationToken cancellationToken = default);
    Task<int> GetCountAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}
