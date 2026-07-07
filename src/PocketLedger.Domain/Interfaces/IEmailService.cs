namespace PocketLedger.Domain.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);
    Task SendVerificationEmailAsync(string to, string verificationLink, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string to, string resetLink, CancellationToken cancellationToken = default);
}
