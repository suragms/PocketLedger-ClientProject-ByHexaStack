using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IAccountRepository : IRepository<Account>
{
    Task<IReadOnlyList<Account>> GetAccountsByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Account?> GetAccountWithTransactionsAsync(int id, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalBalanceAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Account>> GetAccountsWithStatsAsync(string userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Account> Items, int TotalCount)> GetPagedWithUserAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
