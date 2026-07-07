using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.DeleteRole;

public record DeleteRoleCommand : IRequest
{
    public string RoleId { get; init; } = string.Empty;
}

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand>
{
    private readonly RoleManager<Role> _roleManager;

    public DeleteRoleCommandHandler(RoleManager<Role> roleManager) => _roleManager = roleManager;

    public async Task Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByIdAsync(request.RoleId)
            ?? throw new Exception("Role not found");

        if (role.Name == "Admin" || role.Name == "User")
            throw new Exception("Cannot delete built-in roles");

        await _roleManager.DeleteAsync(role);
    }
}
