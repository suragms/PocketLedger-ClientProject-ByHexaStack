using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    public TransactionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Transaction>> GetTransactionsByDateRangeAsync(string userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate && !t.IsDeleted)
            .OrderByDescending(t => t.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalByTypeAsync(string userId, TransactionType type, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.Type == type && t.Date >= startDate && t.Date <= endDate && !t.IsDeleted)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    public async Task<decimal> GetTotalByCategoryAsync(string userId, int categoryId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.CategoryId == categoryId && t.Type == TransactionType.Expense && t.Date >= startDate && t.Date <= endDate && !t.IsDeleted)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    public async Task<IReadOnlyList<Transaction>> GetRecentTransactionsAsync(string userId, int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && !t.IsDeleted)
            .Include(t => t.Category)
            .Include(t => t.Account)
            .OrderByDescending(t => t.Date)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, decimal>> GetSpendingByCategoryAsync(string userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.Type == TransactionType.Expense && t.Date >= startDate && t.Date <= endDate && !t.IsDeleted)
            .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
            .Select(g => new { Category = g.Key, Total = g.Sum(t => t.Amount) })
            .ToDictionaryAsync(x => x.Category, x => x.Total, cancellationToken);
    }

    public async Task<IReadOnlyList<Transaction>> GetTransactionsWithDetailsAsync(
        string userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, int? accountId, int? categoryId, int? tagId,
        decimal? minAmount, decimal? maxAmount, string? search, string? payee,
        string? sortBy, string? sortOrder, int skip, int take,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Transaction> query = _dbSet
            .Include(t => t.Category)
            .Include(t => t.Account)
            .Include(t => t.TransactionTags).ThenInclude(tt => tt.Tag)
            .Where(t => t.UserId == userId && !t.IsDeleted);

        if (startDate.HasValue) query = query.Where(t => t.Date >= startDate.Value);
        if (endDate.HasValue) query = query.Where(t => t.Date <= endDate.Value);
        if (type.HasValue) query = query.Where(t => t.Type == type.Value);
        if (accountId.HasValue) query = query.Where(t => t.AccountId == accountId.Value);
        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
        if (tagId.HasValue) query = query.Where(t => t.TransactionTags.Any(tt => tt.TagId == tagId.Value));
        if (minAmount.HasValue) query = query.Where(t => t.Amount >= minAmount.Value);
        if (maxAmount.HasValue) query = query.Where(t => t.Amount <= maxAmount.Value);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => (t.Note != null && t.Note.Contains(search)) || (t.Payee != null && t.Payee.Contains(search)) || (t.Reference != null && t.Reference.Contains(search)));
        if (!string.IsNullOrWhiteSpace(payee))
            query = query.Where(t => t.Payee != null && t.Payee.Contains(payee));

        query = sortBy?.ToLower() switch
        {
            "amount" => sortOrder?.ToLower() == "asc" ? query.OrderBy(t => t.Amount) : query.OrderByDescending(t => t.Amount),
            "payee" => sortOrder?.ToLower() == "asc" ? query.OrderBy(t => t.Payee) : query.OrderByDescending(t => t.Payee),
            "category" => sortOrder?.ToLower() == "asc" ? query.OrderBy(t => t.Category != null ? t.Category.Name : "") : query.OrderByDescending(t => t.Category != null ? t.Category.Name : ""),
            "account" => sortOrder?.ToLower() == "asc" ? query.OrderBy(t => t.Account.Name) : query.OrderByDescending(t => t.Account.Name),
            _ => sortOrder?.ToLower() == "asc" ? query.OrderBy(t => t.Date) : query.OrderByDescending(t => t.Date)
        };

        return await query.Skip(skip).Take(take).ToListAsync(cancellationToken);
    }

    public async Task<int> GetFilteredCountAsync(
        string userId, DateTime? startDate, DateTime? endDate,
        TransactionType? type, int? accountId, int? categoryId, int? tagId,
        decimal? minAmount, decimal? maxAmount, string? search, string? payee,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Transaction> query = _dbSet.Where(t => t.UserId == userId && !t.IsDeleted);

        if (startDate.HasValue) query = query.Where(t => t.Date >= startDate.Value);
        if (endDate.HasValue) query = query.Where(t => t.Date <= endDate.Value);
        if (type.HasValue) query = query.Where(t => t.Type == type.Value);
        if (accountId.HasValue) query = query.Where(t => t.AccountId == accountId.Value);
        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
        if (tagId.HasValue) query = query.Where(t => t.TransactionTags.Any(tt => tt.TagId == tagId.Value));
        if (minAmount.HasValue) query = query.Where(t => t.Amount >= minAmount.Value);
        if (maxAmount.HasValue) query = query.Where(t => t.Amount <= maxAmount.Value);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => (t.Note != null && t.Note.Contains(search)) || (t.Payee != null && t.Payee.Contains(search)) || (t.Reference != null && t.Reference.Contains(search)));
        if (!string.IsNullOrWhiteSpace(payee))
            query = query.Where(t => t.Payee != null && t.Payee.Contains(payee));

        return await query.CountAsync(cancellationToken);
    }

    public async Task<Transaction?> GetWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Category)
            .Include(t => t.Account)
            .Include(t => t.TransactionTags).ThenInclude(tt => tt.Tag)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Transaction>> GetDeletedTransactionsAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.IsDeleted)
            .Include(t => t.Category)
            .Include(t => t.Account)
            .OrderByDescending(t => t.DeletedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task RestoreAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        transaction.IsDeleted = false;
        transaction.DeletedAt = null;
        transaction.DeletedBy = null;
        _dbSet.Update(transaction);
        await Task.CompletedTask;
    }

    public async Task<decimal> GetTotalByTypeForAccountAsync(string userId, int accountId, TransactionType type, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(t => t.UserId == userId && t.AccountId == accountId && t.Type == type && t.Date >= startDate && t.Date <= endDate && !t.IsDeleted)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    public async Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetPagedForAdminAsync(string? userId, int? type, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Transaction> query = _dbSet
            .Where(t => !t.IsDeleted)
            .Include(t => t.User)
            .Include(t => t.Account)
            .Include(t => t.Category)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(t => t.UserId == userId);
        if (type.HasValue)
            query = query.Where(t => (int)t.Type == type.Value);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(t =>
                (t.Note != null && t.Note.ToLower().Contains(s)) ||
                (t.Payee != null && t.Payee.ToLower().Contains(s)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var paged = await query
            .OrderByDescending(t => t.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (paged, totalCount);
    }
}