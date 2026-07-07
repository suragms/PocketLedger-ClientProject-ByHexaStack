namespace PocketLedger.Application.Features.Auth.DTOs;

public class RefreshTokenRequest
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
