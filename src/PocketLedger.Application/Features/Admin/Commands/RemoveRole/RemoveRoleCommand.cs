using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.RemoveRole;

public record RemoveRoleCommand : IRequest
{
    public string UserId { get; init; } = string.Empty;
    public string RoleName { get; init; } = string.Empty;
}

public class RemoveRoleCommandHandler : IRequestHandler<RemoveRoleCommand>
{
    private readonly UserManager<User> _userManager;

    public RemoveRoleCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task Handle(RemoveRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        if (await _userManager.IsInRoleAsync(user, request.RoleName))
            await _userManager.RemoveFromRoleAsync(user, request.RoleName);
    }
}
