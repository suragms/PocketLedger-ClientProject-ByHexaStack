namespace PocketLedger.Domain.Interfaces;

public interface IWebAuthnService
{
    Task<byte[]> GenerateRegistrationChallengeAsync(string userId, string userName, CancellationToken cancellationToken = default);
    Task<bool> VerifyRegistrationAsync(string userId, byte[] credentialId, byte[] attestationObject, byte[] clientDataJson, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateAuthenticationChallengeAsync(byte[] credentialId, CancellationToken cancellationToken = default);
    Task<bool> VerifyAuthenticationAsync(byte[] credentialId, byte[] authenticatorData, byte[] clientDataJson, byte[] signature, CancellationToken cancellationToken = default);
}
