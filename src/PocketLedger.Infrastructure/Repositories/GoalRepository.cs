using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class GoalRepository : Repository<Goal>, IGoalRepository
{
    public GoalRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Goal>> GetGoalsByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(g => g.UserId == userId && !g.IsDeleted)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Goal?> GetGoalWithAccountAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(g => g.LinkedAccount)
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }
}
