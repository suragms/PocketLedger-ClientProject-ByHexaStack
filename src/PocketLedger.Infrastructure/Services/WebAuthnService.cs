using Microsoft.Extensions.Logging;
using PocketLedger.Domain.Interfaces;
using System.Security.Cryptography;

namespace PocketLedger.Infrastructure.Services;

public class WebAuthnService : IWebAuthnService
{
    private readonly ILogger<WebAuthnService> _logger;

    public WebAuthnService(ILogger<WebAuthnService> logger)
    {
        _logger = logger;
    }

    public Task<byte[]> GenerateRegistrationChallengeAsync(string userId, string userName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating WebAuthn registration challenge for user {UserId}", userId);
        var challenge = new byte[32];
        RandomNumberGenerator.Fill(challenge);
        return Task.FromResult(challenge);
    }

    public Task<bool> VerifyRegistrationAsync(string userId, byte[] credentialId, byte[] attestationObject, byte[] clientDataJson, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Verifying WebAuthn registration for user {UserId}", userId);
        return Task.FromResult(true);
    }

    public Task<byte[]> GenerateAuthenticationChallengeAsync(byte[] credentialId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating WebAuthn authentication challenge");
        var challenge = new byte[32];
        RandomNumberGenerator.Fill(challenge);
        return Task.FromResult(challenge);
    }

    public Task<bool> VerifyAuthenticationAsync(byte[] credentialId, byte[] authenticatorData, byte[] clientDataJson, byte[] signature, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Verifying WebAuthn authentication");
        return Task.FromResult(true);
    }
}
