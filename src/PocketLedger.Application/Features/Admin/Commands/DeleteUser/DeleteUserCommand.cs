using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.DeleteUser;

public record DeleteUserCommand : IRequest
{
    public string UserId { get; init; } = string.Empty;
}

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly UserManager<User> _userManager;

    public DeleteUserCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        user.IsActive = false;
        user.Email = $"deleted_{user.Id}@deleted.local";
        user.UserName = $"deleted_{user.Id}";
        await _userManager.UpdateAsync(user);
    }
}
