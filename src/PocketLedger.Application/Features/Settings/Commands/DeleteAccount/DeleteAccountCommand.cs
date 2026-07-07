using MediatR;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.DeleteAccount;

public record DeleteAccountCommand : IRequest
{
    public string Password { get; set; } = string.Empty;
}

public class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public DeleteAccountCommandHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
            throw new Exception("Invalid password");

        // Soft delete - mark as inactive
        user.IsActive = false;
        user.Email = $"deleted_{user.Id}@deleted.local";
        user.UserName = $"deleted_{user.Id}";
        await _userManager.UpdateAsync(user);

        // Remove all tokens
        await _userManager.RemoveAuthenticationTokenAsync(user, "PocketLedger", "RefreshToken");
        await _userManager.UpdateAsync(user);
    }
}
