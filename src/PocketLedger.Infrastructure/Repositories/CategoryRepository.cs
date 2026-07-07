using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Category>> GetCategoriesByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.UserId == userId && c.ParentId == null)
            .Include(c => c.Children.Where(ch => !ch.IsDeleted))
            .Include(c => c.Transactions.Where(t => !t.IsDeleted))
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetCategoryWithTransactionsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Transactions.Where(t => !t.IsDeleted))
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Category> Items, int TotalCount)> GetPagedWithUserAsync(string? userId, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Category> query = _dbSet
            .Where(c => !c.IsDeleted)
            .Include(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(c => c.UserId == userId);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var paged = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (paged, totalCount);
    }
}
