using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.DeleteAccount;

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public DeleteAccountCommandHandler(UserManager<User> userManager, ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId)
            ?? throw new InvalidOperationException("User not found.");

        var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid password.");

        user.IsActive = false;
        user.Email = null;
        user.UserName = null;
        await _userManager.UpdateAsync(user);

        return Unit.Value;
    }
}
