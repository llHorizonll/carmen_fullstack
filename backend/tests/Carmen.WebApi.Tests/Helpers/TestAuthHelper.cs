using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Carmen.WebApi.Tests.Helpers;

public static class TestAuthHelper
{
    // Must match appsettings.json
    private const string SecretKey = "carmen-secret-key-at-least-32-characters-long";
    private const string Issuer = "Carmen";
    private const string Audience = "CarmenUsers";

    public static string GenerateToken(
        Guid userId,
        Guid tenantId,
        string email = "test@carmen.dev",
        string tenantCode = "TEST",
        IEnumerable<string>? roles = null,
        IEnumerable<string>? permissions = null)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("tenantId", tenantId.ToString()),
            new("tenantCode", tenantCode)
        };

        if (roles != null)
        {
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (permissions != null)
        {
            foreach (var permission in permissions)
                claims.Add(new Claim("permission", permission));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static string AdminToken(Guid userId, Guid tenantId) =>
        GenerateToken(userId, tenantId, permissions: new[] { "*" }, roles: new[] { "Admin" });

    public static string ViewOnlyToken(Guid userId, Guid tenantId, params string[] viewPermissions) =>
        GenerateToken(userId, tenantId, permissions: viewPermissions);
}
