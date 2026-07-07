using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Queries.Get2FAStatus;

public record Get2FAStatusQuery : IRequest<TwoFactorStatusDto>;

public class TwoFactorStatusDto
{
    public bool IsEnabled { get; set; }
    public DateTime? EnabledAt { get; set; }
    public int RecoveryCodesRemaining { get; set; }
}

public class Get2FAStatusQueryHandler : IRequestHandler<Get2FAStatusQuery, TwoFactorStatusDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public Get2FAStatusQueryHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<TwoFactorStatusDto> Handle(Get2FAStatusQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        return new TwoFactorStatusDto
        {
            IsEnabled = user.TwoFactorEnabled,
            EnabledAt = user.TwoFactorEnabledAt,
            RecoveryCodesRemaining = user.TwoFactorRecoveryCodes?.Length ?? 0
        };
    }
}
