using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IBudgetRepository : IRepository<Budget>
{
    Task<IReadOnlyList<Budget>> GetBudgetsByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Budget?> GetBudgetWithCategoryAsync(int id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Budget> Items, int TotalCount)> GetPagedWithDetailsAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
