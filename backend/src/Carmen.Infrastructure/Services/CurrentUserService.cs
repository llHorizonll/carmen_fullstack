using System.Security.Claims;
using Carmen.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Carmen.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.FindFirst("sub")?.Value;

            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    public Guid? TenantId
    {
        get
        {
            var tenantIdClaim = User?.FindFirst("tenantId")?.Value;
            return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : null;
        }
    }

    public string? Email => User?.FindFirst(ClaimTypes.Email)?.Value
        ?? User?.FindFirst("email")?.Value;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public IEnumerable<string> Roles => User?.Claims
        .Where(c => c.Type == ClaimTypes.Role)
        .Select(c => c.Value) ?? Enumerable.Empty<string>();

    public IEnumerable<string> Permissions => User?.Claims
        .Where(c => c.Type == "permission")
        .Select(c => c.Value) ?? Enumerable.Empty<string>();

    public bool HasPermission(string permission)
    {
        if (Permissions.Contains("*")) return true;
        return Permissions.Contains(permission);
    }
}
