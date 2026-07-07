using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly UserManager<User> _userManager;

    public UserRepository(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _userManager.Users.ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _userManager.FindByIdAsync(userId);
    }

    public async Task<User?> GetByIdWithPasskeysAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _userManager.Users
            .Include(u => u.Passkeys)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public async Task<IReadOnlyList<User>> GetByIdsAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default)
    {
        var userIdList = userIds.ToList();
        return await _userManager.Users
            .Where(u => userIdList.Contains(u.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetFilteredAsync(string? search, bool? isActive, CancellationToken cancellationToken = default)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(searchLower)) ||
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        await _userManager.UpdateAsync(user);
    }

    public async Task<IReadOnlyList<string>> GetRolesAsync(User user, CancellationToken cancellationToken = default)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToList();
    }

    public async Task AddToRoleAsync(User user, string role, CancellationToken cancellationToken = default)
    {
        await _userManager.AddToRoleAsync(user, role);
    }

    public async Task RemoveFromRoleAsync(User user, string role, CancellationToken cancellationToken = default)
    {
        await _userManager.RemoveFromRoleAsync(user, role);
    }

    public async Task<bool> IsInRoleAsync(User user, string role, CancellationToken cancellationToken = default)
    {
        return await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<IReadOnlyList<UserPasskey>> GetPasskeysByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users
            .Include(u => u.Passkeys)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        return user?.Passkeys?.ToList() ?? new List<UserPasskey>();
    }

    public async Task<UserPasskey?> GetPasskeyByIdAsync(int passkeyId, CancellationToken cancellationToken = default)
    {
        return null;
    }

    public async Task RemovePasskeyAsync(UserPasskey passkey, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(passkey.UserId);
        if (user != null)
        {
            user.Passkeys.Remove(passkey);
            await _userManager.UpdateAsync(user);
        }
    }

    public async Task AddPasskeyAsync(UserPasskey passkey, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(passkey.UserId);
        if (user != null)
        {
            user.Passkeys.Add(passkey);
            await _userManager.UpdateAsync(user);
        }
    }
}
