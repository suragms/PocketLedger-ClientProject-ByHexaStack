using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.UpdateUserRole;

public record UpdateUserRoleCommand : IRequest<UserRoleResult>
{
    public string UserId { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

public class UserRoleResult
{
    public string UserId { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, UserRoleResult>
{
    private readonly UserManager<User> _userManager;

    public UpdateUserRoleCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task<UserRoleResult> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, request.Role);

        return new UserRoleResult
        {
            UserId = user.Id,
            Roles = new List<string> { request.Role }
        };
    }
}
