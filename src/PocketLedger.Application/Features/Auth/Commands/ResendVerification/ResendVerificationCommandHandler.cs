using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Auth.Commands.ResendVerification;

public class ResendVerificationCommandHandler : IRequestHandler<ResendVerificationCommand, Unit>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public ResendVerificationCommandHandler(UserManager<User> userManager, IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unit.Value;

        if (user.EmailVerified)
            return Unit.Value;

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var verificationLink = $"http://localhost:5173/verify-email?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(request.Email)}";
        await _emailService.SendVerificationEmailAsync(request.Email, verificationLink, cancellationToken);

        return Unit.Value;
    }
}
