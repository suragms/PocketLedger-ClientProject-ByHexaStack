using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using FluentValidation;

namespace PocketLedger.Application.Features.Admin.Commands.CreateUser;

public record CreateUserCommand : IRequest<string>
{
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string Role { get; init; } = "User";
}

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Role).Must(role => role == "User" || role == "Admin").WithMessage("Role must be 'User' or 'Admin'.");
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, string>
{
    private readonly UserManager<User> _userManager;

    public CreateUserCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists.");

        var user = new User
        {
            Email = request.Email,
            UserName = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            EmailVerified = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        await _userManager.AddToRoleAsync(user, request.Role);
        
        return user.Id;
    }
}
