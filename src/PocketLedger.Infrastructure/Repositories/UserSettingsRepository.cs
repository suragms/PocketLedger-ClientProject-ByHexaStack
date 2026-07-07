using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;

namespace PocketLedger.Infrastructure.Repositories;

public class UserSettingsRepository : IUserSettingsRepository
{
    private readonly ApplicationDbContext _context;

    public UserSettingsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserSettings?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
    }

    public async Task<UserSettings> CreateAsync(UserSettings settings, CancellationToken cancellationToken = default)
    {
        _context.UserSettings.Add(settings);
        await _context.SaveChangesAsync(cancellationToken);
        return settings;
    }

    public async Task<UserSettings> UpdateAsync(UserSettings settings, CancellationToken cancellationToken = default)
    {
        _context.UserSettings.Update(settings);
        await _context.SaveChangesAsync(cancellationToken);
        return settings;
    }
}
