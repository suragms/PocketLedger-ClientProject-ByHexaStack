using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IUserSettingsRepository
{
    Task<UserSettings?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<UserSettings> CreateAsync(UserSettings settings, CancellationToken cancellationToken = default);
    Task<UserSettings> UpdateAsync(UserSettings settings, CancellationToken cancellationToken = default);
}
