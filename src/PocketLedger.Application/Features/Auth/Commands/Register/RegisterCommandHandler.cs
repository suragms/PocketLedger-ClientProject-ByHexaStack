using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly string _frontendUrl;

    public RegisterCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        IMapper mapper,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _mapper = mapper;
        _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
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
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            throw new InvalidOperationException(string.Join(", ", errors));
        }

        await _userManager.AddToRoleAsync(user, "User");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(user, roles);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        var emailVerificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var verificationLink = $"{_frontendUrl}/verify-email?token={Uri.EscapeDataString(emailVerificationToken)}&email={Uri.EscapeDataString(request.Email)}";
        await _emailService.SendVerificationEmailAsync(request.Email, verificationLink, cancellationToken);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiration = DateTime.UtcNow.AddMinutes(60),
            User = new UserProfile
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
            }
        };
    }
}
