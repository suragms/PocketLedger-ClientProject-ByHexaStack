using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class AccountRepository : Repository<Account>, IAccountRepository
{
    public AccountRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Account>> GetAccountsByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .Include(a => a.Transactions.Where(t => !t.IsDeleted))
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Account?> GetAccountWithTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(a => a.Transactions.Where(t => !t.IsDeleted))
                .ThenInclude(t => t.Category)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<decimal> GetTotalBalanceAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.UserId == userId && a.IncludeInBalance && !a.IsDeleted)
            .SumAsync(a => a.Balance, cancellationToken);
    }

    public async Task<IReadOnlyList<Account>> GetAccountsWithStatsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .Include(a => a.Transactions.Where(t => !t.IsDeleted))
                .ThenInclude(t => t.Category)
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Account> Items, int TotalCount)> GetPagedWithUserAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Account> query = _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(a => a.UserId == userId);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(a => a.Name.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var paged = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (paged, totalCount);
    }
}
