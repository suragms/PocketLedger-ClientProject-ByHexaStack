using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Queries.GetRoles;

public record GetRolesQuery : IRequest<RolesDto>;

public class RolesDto
{
    public List<RoleDto> Roles { get; set; } = new();
}

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int UserCount { get; set; }
}

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, RolesDto>
{
    private readonly RoleManager<Role> _roleManager;
    private readonly UserManager<User> _userManager;

    public GetRolesQueryHandler(RoleManager<Role> roleManager, UserManager<User> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<RolesDto> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = _roleManager.Roles.ToList();
        var result = new List<RoleDto>();

        foreach (var role in roles)
        {
            var users = await _userManager.GetUsersInRoleAsync(role.Name!);
            result.Add(new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? "",
                Description = role.Description,
                UserCount = users.Count
            });
        }

        return new RolesDto { Roles = result };
    }
}
