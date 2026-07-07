using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileCommand : IRequest<UpdateProfileResponse>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
}

public class UpdateProfileResponse
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
}
