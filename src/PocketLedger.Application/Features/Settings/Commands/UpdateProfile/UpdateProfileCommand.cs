using MediatR;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Application.Features.Settings.Queries.GetProfile;

namespace PocketLedger.Application.Features.Settings.Commands.UpdateProfile;

public record UpdateProfileCommand : IRequest<ProfileDto>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DefaultCurrency { get; set; } = "USD";
}

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.DefaultCurrency).NotEmpty().Length(3);
    }
}

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ProfileDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public UpdateProfileCommandHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<ProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.DefaultCurrency = request.DefaultCurrency;

        await _userManager.UpdateAsync(user);

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
