using Carmen.Application.Interfaces;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Fixtures;

/// <summary>
/// Mock implementation of ICurrentUserService for unit/integration tests
/// </summary>
public class MockCurrentUserService : ICurrentUserService
{
    public Guid? UserId { get; set; } = TestConstants.DefaultUserId;
    public Guid? TenantId { get; set; } = TestConstants.DefaultTenantId;
    public string? Email { get; set; } = TestConstants.DefaultEmail;
    public bool IsAuthenticated { get; set; } = true;
    public IEnumerable<string> Roles { get; set; } = new[] { "Admin" };
    public IEnumerable<string> Permissions { get; set; } = new[] { "*" };

    public bool HasPermission(string permission)
    {
        return Permissions.Any(p => p == "*" || p.Equals(permission, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Creates a MockCurrentUserService for a specific tenant
    /// </summary>
    public static MockCurrentUserService ForTenant(Guid tenantId, Guid? userId = null)
    {
        return new MockCurrentUserService
        {
            TenantId = tenantId,
            UserId = userId ?? TestConstants.DefaultUserId,
        };
    }

    /// <summary>
    /// Creates a MockCurrentUserService with limited permissions
    /// </summary>
    public static MockCurrentUserService WithPermissions(params string[] permissions)
    {
        return new MockCurrentUserService
        {
            Permissions = permissions,
        };
    }

    /// <summary>
    /// Creates an unauthenticated MockCurrentUserService
    /// </summary>
    public static MockCurrentUserService Unauthenticated()
    {
        return new MockCurrentUserService
        {
            IsAuthenticated = false,
            UserId = null,
            TenantId = null,
            Email = null,
            Roles = Enumerable.Empty<string>(),
            Permissions = Enumerable.Empty<string>(),
        };
    }
}
