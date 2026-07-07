using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IReadOnlyList<Transaction>> GetTransactionsByDateRangeAsync(string userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByTypeAsync(string userId, TransactionType type, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByCategoryAsync(string userId, int categoryId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetRecentTransactionsAsync(string userId, int count, CancellationToken cancellationToken = default);
    Task<Dictionary<string, decimal>> GetSpendingByCategoryAsync(string userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetTransactionsWithDetailsAsync(
        string userId,
        DateTime? startDate, DateTime? endDate,
        TransactionType? type, int? accountId, int? categoryId,
        decimal? minAmount, decimal? maxAmount,
        string? search, string? payee,
        string? sortBy, string? sortOrder,
        int skip, int take,
        CancellationToken cancellationToken = default);
    Task<int> GetFilteredCountAsync(
        string userId,
        DateTime? startDate, DateTime? endDate,
        TransactionType? type, int? accountId, int? categoryId,
        decimal? minAmount, decimal? maxAmount,
        string? search, string? payee,
        CancellationToken cancellationToken = default);
    Task<Transaction?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Transaction>> GetDeletedTransactionsAsync(string userId, CancellationToken cancellationToken = default);
    Task RestoreAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalByTypeForAccountAsync(string userId, int accountId, TransactionType type, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetPagedForAdminAsync(string? userId, int? type, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}