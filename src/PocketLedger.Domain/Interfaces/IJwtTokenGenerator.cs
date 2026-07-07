using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IList<string> roles);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
}
