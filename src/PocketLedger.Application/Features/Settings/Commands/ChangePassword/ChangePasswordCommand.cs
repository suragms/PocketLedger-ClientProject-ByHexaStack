using MediatR;
using Microsoft.AspNetCore.Identity;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.ChangePassword;

public record ChangePasswordCommand : IRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("Must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("Must contain at least one digit")
            .Matches("[^a-zA-Z0-9]").WithMessage("Must contain at least one special character");
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;

    public ChangePasswordCommandHandler(UserManager<User> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Failed to change password: {errors}");
        }
    }
}
