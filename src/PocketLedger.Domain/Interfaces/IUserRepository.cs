using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<User?> GetByIdWithPasskeysAsync(string userId, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetByIdsAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetFilteredAsync(string? search, bool? isActive, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetRolesAsync(User user, CancellationToken cancellationToken = default);
    Task AddToRoleAsync(User user, string role, CancellationToken cancellationToken = default);
    Task RemoveFromRoleAsync(User user, string role, CancellationToken cancellationToken = default);
    Task<bool> IsInRoleAsync(User user, string role, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserPasskey>> GetPasskeysByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<UserPasskey?> GetPasskeyByIdAsync(int passkeyId, CancellationToken cancellationToken = default);
    Task RemovePasskeyAsync(UserPasskey passkey, CancellationToken cancellationToken = default);
    Task AddPasskeyAsync(UserPasskey passkey, CancellationToken cancellationToken = default);
}
