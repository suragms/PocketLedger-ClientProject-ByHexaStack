namespace PocketLedger.Application.Features.Auth.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserProfile User { get; set; } = null!;
}

public class UserProfile
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
    public bool EmailVerified { get; set; }
    public bool PinEnabled { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
}
