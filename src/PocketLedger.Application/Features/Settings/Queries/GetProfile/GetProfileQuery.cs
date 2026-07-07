using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Queries.GetProfile;

public record GetProfileQuery : IRequest<ProfileDto>;

public class ProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
    public bool EmailVerified { get; set; }
    public bool PinEnabled { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public GetProfileQueryHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        return new ProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            DefaultCurrency = user.DefaultCurrency,
            EmailVerified = user.EmailVerified,
            PinEnabled = user.PinEnabled,
            TwoFactorEnabled = user.TwoFactorEnabled,
            CreatedAt = user.CreatedAt
        };
    }
}
