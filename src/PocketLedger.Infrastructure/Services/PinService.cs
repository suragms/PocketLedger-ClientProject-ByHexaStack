using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using PocketLedger.Domain.Interfaces;
using System.Security.Cryptography;

namespace PocketLedger.Infrastructure.Services;

public class PinService : IPinService
{
    public string HashPin(string pin)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = KeyDerivation.Pbkdf2(
            password: pin,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 32);

        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPin(string pin, string hash)
    {
        var parts = hash.Split('.');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var storedHash = Convert.FromBase64String(parts[1]);

        var computedHash = KeyDerivation.Pbkdf2(
            password: pin,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 32);

        return CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
    }
}
