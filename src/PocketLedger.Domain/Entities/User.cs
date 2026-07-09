using Microsoft.AspNetCore.Identity;

namespace PocketLedger.Domain.Entities;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailVerified { get; set; }
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiry { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }
    public string? PinHash { get; set; }
    public bool PinEnabled { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
    public string? SecurityStamp2 { get; set; }

    // 2FA
    public new bool TwoFactorEnabled { get; set; }
    public string? TwoFactorSecretKey { get; set; }
    public string[] TwoFactorRecoveryCodes { get; set; } = Array.Empty<string>();
    public DateTime? TwoFactorEnabledAt { get; set; }

    public UserSettings? Settings { get; set; }

    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserPasskey> Passkeys { get; set; } = new List<UserPasskey>();
}
