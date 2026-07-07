using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfile>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public GetCurrentUserQueryHandler(
        UserManager<User> userManager,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<UserProfile> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId)
            ?? throw new NotFoundException(nameof(User), _currentUserService.UserId);

        var roles = await _userManager.GetRolesAsync(user);

        return new UserProfile
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            DefaultCurrency = user.DefaultCurrency,
            EmailVerified = user.EmailVerified,
            PinEnabled = user.PinEnabled,
            Roles = roles
        };
    }
}
