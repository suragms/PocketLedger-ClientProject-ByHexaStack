using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.CreateRole;

public record CreateRoleCommand : IRequest<RoleResult>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public class RoleResult
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, RoleResult>
{
    private readonly RoleManager<Role> _roleManager;

    public CreateRoleCommandHandler(RoleManager<Role> roleManager) => _roleManager = roleManager;

    public async Task<RoleResult> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = new Role { Name = request.Name, Description = request.Description };
        var result = await _roleManager.CreateAsync(role);
        if (!result.Succeeded)
            throw new Exception($"Failed to create role: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return new RoleResult { Id = role.Id, Name = role.Name ?? "" };
    }
}
