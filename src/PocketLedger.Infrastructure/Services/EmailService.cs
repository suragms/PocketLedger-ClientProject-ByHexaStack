using Microsoft.Extensions.Logging;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email sent to {To} with subject: {Subject}", to, subject);
        _logger.LogDebug("Email body: {Body}", htmlBody);
        await Task.CompletedTask;
    }

    public async Task SendVerificationEmailAsync(string to, string verificationLink, CancellationToken cancellationToken = default)
    {
        var subject = "Verify your PocketLedger email";
        var body = $"""
            <h1>Welcome to PocketLedger!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="{verificationLink}" style="display:inline-block;padding:12px 24px;background-color:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            """;
        await SendAsync(to, subject, body, cancellationToken);
    }

    public async Task SendPasswordResetEmailAsync(string to, string resetLink, CancellationToken cancellationToken = default)
    {
        var subject = "Reset your PocketLedger password";
        var body = $"""
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="{resetLink}" style="display:inline-block;padding:12px 24px;background-color:#ef4444;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            """;
        await SendAsync(to, subject, body, cancellationToken);
    }
}
