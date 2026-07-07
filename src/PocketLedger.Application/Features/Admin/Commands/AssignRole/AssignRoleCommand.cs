using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.AssignRole;

public record AssignRoleCommand : IRequest
{
    public string UserId { get; init; } = string.Empty;
    public string RoleName { get; init; } = string.Empty;
}

public class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand>
{
    private readonly UserManager<User> _userManager;

    public AssignRoleCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        if (!await _userManager.IsInRoleAsync(user, request.RoleName))
            await _userManager.AddToRoleAsync(user, request.RoleName);
    }
}
