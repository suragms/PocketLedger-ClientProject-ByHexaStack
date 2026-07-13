using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IGoalRepository : IRepository<Goal>
{
    Task<IReadOnlyList<Goal>> GetGoalsByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Goal?> GetGoalWithAccountAsync(int id, CancellationToken cancellationToken = default);
}
