using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using FluentValidation;

namespace PocketLedger.Application.Features.Admin.Commands.UpdateUser;

public record UpdateUserCommand : IRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? Password { get; init; }
    public string Role { get; init; } = "User";
}

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Password).Must(p => string.IsNullOrEmpty(p) || p.Length >= 8)
            .WithMessage("Password must be at least 8 characters if specified.");
        RuleFor(x => x.Role).Must(role => role == "User" || role == "Admin").WithMessage("Role must be 'User' or 'Admin'.");
    }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly UserManager<User> _userManager;

    public UpdateUserCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        if (user.Email != request.Email)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new InvalidOperationException("User with this email already exists.");
            
            user.Email = request.Email;
            user.UserName = request.Email;
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(request.Role))
        {
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, request.Role);
        }

        if (!string.IsNullOrEmpty(request.Password))
        {
            await _userManager.RemovePasswordAsync(user);
            var addResult = await _userManager.AddPasswordAsync(user, request.Password);
            if (!addResult.Succeeded)
            {
                var errors = addResult.Errors.Select(e => e.Description);
                throw new InvalidOperationException(string.Join(", ", errors));
            }
        }
    }
}
