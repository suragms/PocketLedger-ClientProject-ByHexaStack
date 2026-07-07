using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.SetPin;

public class SetPinCommandHandler : IRequestHandler<SetPinCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPinService _pinService;

    public SetPinCommandHandler(
        UserManager<User> userManager,
        ICurrentUserService currentUserService,
        IPinService pinService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _pinService = pinService;
    }

    public async Task<Unit> Handle(SetPinCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId)
            ?? throw new InvalidOperationException("User not found.");

        user.PinHash = _pinService.HashPin(request.Pin);
        user.PinEnabled = true;
        await _userManager.UpdateAsync(user);

        return Unit.Value;
    }
}
