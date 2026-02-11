using Carmen.Domain.Entities.Auth;

namespace Carmen.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions, Tenant? activeTenant);
    string GenerateRefreshToken();
    Guid? ValidateAccessToken(string token);
    bool ValidateRefreshToken(string token, out Guid userId);
}
