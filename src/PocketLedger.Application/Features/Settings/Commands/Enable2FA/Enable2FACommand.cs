using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using System.Security.Cryptography;

namespace PocketLedger.Application.Features.Settings.Commands.Enable2FA;

public record Enable2FACommand : IRequest<TwoFactorSetupDto>;

public class TwoFactorSetupDto
{
    public string SecretKey { get; set; } = string.Empty;
    public string[] RecoveryCodes { get; set; } = Array.Empty<string>();
    public string QrCodeUri { get; set; } = string.Empty;
}

public class Enable2FACommandHandler : IRequestHandler<Enable2FACommand, TwoFactorSetupDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public Enable2FACommandHandler(IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task<TwoFactorSetupDto> Handle(Enable2FACommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId!, cancellationToken)
            ?? throw new Exception("User not found");

        if (user.TwoFactorEnabled)
            throw new Exception("2FA is already enabled");

        var secretKey = GenerateSecretKey();
        var recoveryCodes = GenerateRecoveryCodes(10);

        user.TwoFactorSecretKey = secretKey;
        user.TwoFactorRecoveryCodes = recoveryCodes;
        user.TwoFactorEnabled = true;
        user.TwoFactorEnabledAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        var qrCodeUri = $"otpauth://totp/PocketLedger:{user.Email}?secret={secretKey}&issuer=PocketLedger";

        return new TwoFactorSetupDto
        {
            SecretKey = secretKey,
            RecoveryCodes = recoveryCodes,
            QrCodeUri = qrCodeUri
        };
    }

    private static string GenerateSecretKey()
    {
        var bytes = new byte[20];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "").Replace("/", "").Replace("=", "").Substring(0, 32);
    }

    private static string[] GenerateRecoveryCodes(int count)
    {
        var codes = new string[count];
        for (int i = 0; i < count; i++)
        {
            var bytes = new byte[4];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            codes[i] = BitConverter.ToString(bytes).Replace("-", "").Substring(0, 8);
        }
        return codes;
    }
}
