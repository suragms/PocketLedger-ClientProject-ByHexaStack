using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class BudgetRepository : Repository<Budget>, IBudgetRepository
{
    public BudgetRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Budget>> GetBudgetsByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && !b.IsDeleted)
            .Include(b => b.Category)
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Budget?> GetBudgetWithCategoryAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Budget> Items, int TotalCount)> GetPagedWithDetailsAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Budget> query = _dbSet
            .Where(b => !b.IsDeleted)
            .Include(b => b.User)
            .Include(b => b.Category)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(b => b.UserId == userId);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var paged = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (paged, totalCount);
    }
}
