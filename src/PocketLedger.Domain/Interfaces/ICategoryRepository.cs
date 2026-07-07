using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<IReadOnlyList<Category>> GetCategoriesByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Category?> GetCategoryWithTransactionsAsync(int id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Category> Items, int TotalCount)> GetPagedWithUserAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
