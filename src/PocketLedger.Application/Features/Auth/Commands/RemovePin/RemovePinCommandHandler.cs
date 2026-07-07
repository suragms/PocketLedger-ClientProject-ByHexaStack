using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.RemovePin;

public class RemovePinCommandHandler : IRequestHandler<RemovePinCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public RemovePinCommandHandler(UserManager<User> userManager, ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(RemovePinCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId)
            ?? throw new InvalidOperationException("User not found.");

        user.PinHash = null;
        user.PinEnabled = false;
        await _userManager.UpdateAsync(user);

        return Unit.Value;
    }
}
