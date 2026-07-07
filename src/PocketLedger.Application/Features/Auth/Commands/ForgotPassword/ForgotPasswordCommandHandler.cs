using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;
    private readonly string _frontendUrl;

    public ForgotPasswordCommandHandler(
        UserManager<User> userManager,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _emailService = emailService;
        _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
    }

    public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unit.Value;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userManager.UpdateAsync(user);

        var resetLink = $"{_frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(request.Email)}";
        await _emailService.SendPasswordResetEmailAsync(request.Email, resetLink, cancellationToken);

        return Unit.Value;
    }
}
