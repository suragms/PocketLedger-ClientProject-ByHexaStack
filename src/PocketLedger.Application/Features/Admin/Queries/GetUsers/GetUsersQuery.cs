using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetUsers;

public record GetUsersQuery : IRequest<PagedUsersDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? Role { get; init; }
    public bool? IsActive { get; init; }
}

public class PagedUsersDto
{
    public List<UserListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class UserListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PagedUsersDto>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedUsersDto> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var allUsers = await _userRepository.GetFilteredAsync(request.Search, request.IsActive, cancellationToken);

        var filteredUsers = new List<Domain.Entities.User>();
        foreach (var user in allUsers)
        {
            var roles = await _userRepository.GetRolesAsync(user, cancellationToken);
            if (!string.IsNullOrEmpty(request.Role) && !roles.Contains(request.Role))
                continue;
            filteredUsers.Add(user);
        }

        var totalCount = filteredUsers.Count;
        var pagedUsers = filteredUsers
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var items = new List<UserListItemDto>();
        foreach (var user in pagedUsers)
        {
            var roles = await _userRepository.GetRolesAsync(user, cancellationToken);
            items.Add(new UserListItemDto
            {
                Id = user.Id,
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                AvatarUrl = user.AvatarUrl,
                IsActive = user.IsActive,
                EmailVerified = user.EmailVerified,
                TwoFactorEnabled = user.TwoFactorEnabled,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Roles = roles.ToList()
            });
        }

        return new PagedUsersDto
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
