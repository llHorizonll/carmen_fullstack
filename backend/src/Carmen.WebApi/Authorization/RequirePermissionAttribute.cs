using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Authorization;

/// <summary>
/// Requires the user to have the specified permission to access the action.
/// Can be applied to controllers or individual actions.
/// Supports multiple permissions (any match).
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : TypeFilterAttribute
{
    public RequirePermissionAttribute(string permission)
        : base(typeof(RequirePermissionFilter))
    {
        Arguments = new object[] { permission };
        Order = 1; // Run after authentication
    }

    public RequirePermissionAttribute(params string[] permissions)
        : base(typeof(RequirePermissionFilter))
    {
        Arguments = new object[] { string.Join(",", permissions) };
        Order = 1;
    }
}
