using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UpdateProfileResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProfileCommandHandler(UserManager<User> userManager, ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<UpdateProfileResponse> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_currentUserService.UserId))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId)
            ?? throw new NotFoundException(nameof(User), _currentUserService.UserId);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.AvatarUrl = request.AvatarUrl;
        user.DefaultCurrency = request.DefaultCurrency;

        await _userManager.UpdateAsync(user);

        return new UpdateProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            DefaultCurrency = user.DefaultCurrency
        };
    }
}
