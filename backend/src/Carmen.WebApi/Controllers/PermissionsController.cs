using Carmen.Application.DTOs.Auth;
using Carmen.Application.Services.Auth;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Permission management endpoints
/// </summary>
[ApiController]
[Route("api/v1/permissions")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    /// <summary>
    /// Get all available permissions
    /// </summary>
    [HttpGet]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(List<PermissionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PermissionDto>>> GetPermissions()
    {
        var permissions = await _permissionService.GetAllPermissionsAsync();
        return Ok(permissions);
    }

    /// <summary>
    /// Get permissions grouped by module
    /// </summary>
    [HttpGet("grouped")]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(List<PermissionGroupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PermissionGroupDto>>> GetPermissionsGrouped()
    {
        var groups = await _permissionService.GetPermissionsGroupedByModuleAsync();
        return Ok(groups);
    }
}
