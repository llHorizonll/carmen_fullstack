using Carmen.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Carmen.WebApi.Authorization;

/// <summary>
/// Authorization filter that checks if the current user has the required permission.
/// Returns 401 if not authenticated, 403 if permission denied.
/// </summary>
public class RequirePermissionFilter : IAuthorizationFilter
{
    private readonly string _permission;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RequirePermissionFilter> _logger;

    public RequirePermissionFilter(
        string permission,
        ICurrentUserService currentUserService,
        ILogger<RequirePermissionFilter> logger)
    {
        _permission = permission;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Skip if user is not authenticated
        if (!_currentUserService.IsAuthenticated)
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "Authentication required",
                code = "AUTHENTICATION_REQUIRED"
            });
            return;
        }

        // Check for multiple permissions (comma-separated - ANY match)
        var permissions = _permission.Split(',', StringSplitOptions.RemoveEmptyEntries);
        var hasAnyPermission = permissions.Any(p => _currentUserService.HasPermission(p.Trim()));

        if (!hasAnyPermission)
        {
            _logger.LogWarning(
                "User {UserId} denied access to {Action}. Required permission: {Permission}",
                _currentUserService.UserId,
                context.ActionDescriptor.DisplayName,
                _permission);

            context.Result = new ObjectResult(new
            {
                message = $"Access denied. Required permission: {_permission}",
                code = "PERMISSION_DENIED",
                requiredPermission = _permission
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}
