using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _frontendUrl;

    public RegisterCommandHandler(
        UserManager<User> userManager,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        IMapper mapper,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
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

        await SeedStarterDataAsync(user.Id, cancellationToken);

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

    private async Task SeedStarterDataAsync(string userId, CancellationToken cancellationToken)
    {
        var existingCategories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(userId, cancellationToken);
        if (existingCategories.Count > 0) return;

        var starterCategories = new List<Category>
        {
            new() { Name = "Food & Dining", Description = "Restaurants, groceries, and food delivery", Icon = "utensils", Color = "#ef4444", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 1, CreatedAt = DateTime.UtcNow },
            new() { Name = "Transportation", Description = "Gas, public transit, rideshare, and parking", Icon = "car", Color = "#f97316", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 2, CreatedAt = DateTime.UtcNow },
            new() { Name = "Bills & Utilities", Description = "Electric, water, internet, and phone bills", Icon = "bolt", Color = "#eab308", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 3, CreatedAt = DateTime.UtcNow },
            new() { Name = "Entertainment", Description = "Movies, games, streaming, and hobbies", Icon = "film", Color = "#22c55e", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 4, CreatedAt = DateTime.UtcNow },
            new() { Name = "Shopping", Description = "Clothing, electronics, and general shopping", Icon = "shopping-bag", Color = "#3b82f6", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 5, CreatedAt = DateTime.UtcNow },
            new() { Name = "Health & Fitness", Description = "Gym, medical expenses, and wellness", Icon = "heart", Color = "#ec4899", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 6, CreatedAt = DateTime.UtcNow },
            new() { Name = "Education", Description = "Courses, books, and learning materials", Icon = "academic-cap", Color = "#8b5cf6", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 7, CreatedAt = DateTime.UtcNow },
            new() { Name = "Salary", Description = "Regular employment income", Icon = "currency-dollar", Color = "#22c55e", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 8, CreatedAt = DateTime.UtcNow },
            new() { Name = "Freelance", Description = "Freelance and side project income", Icon = "briefcase", Color = "#14b8a6", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 9, CreatedAt = DateTime.UtcNow },
            new() { Name = "Investments", Description = "Investment returns and dividends", Icon = "chart-bar", Color = "#06b6d4", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 10, CreatedAt = DateTime.UtcNow },
            new() { Name = "Rent & Housing", Description = "Rent, mortgage, and home expenses", Icon = "home", Color = "#6366f1", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 11, CreatedAt = DateTime.UtcNow },
            new() { Name = "Personal Care", Description = "Haircuts, cosmetics, and personal hygiene", Icon = "user", Color = "#d946ef", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 12, CreatedAt = DateTime.UtcNow },
        };

        foreach (var category in starterCategories)
            await _unitOfWork.Categories.AddAsync(category, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
