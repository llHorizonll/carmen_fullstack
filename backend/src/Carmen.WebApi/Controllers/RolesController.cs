using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Auth;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Role management endpoints
/// </summary>
[ApiController]
[Route("api/v1/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(IRoleService roleService, ILogger<RolesController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of roles
    /// </summary>
    [HttpGet]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(PaginatedResult<RoleListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<RoleListDto>>> GetRoles(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "Name",
        [FromQuery] bool sortDescending = false)
    {
        var query = new RoleQueryParams(
            Search: search,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _roleService.GetRolesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get roles for lookup (dropdown)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(List<RoleLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RoleLookupDto>>> GetRoleLookup()
    {
        var roles = await _roleService.GetRoleLookupAsync();
        return Ok(roles);
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoleDto>> GetRole([FromRoute] Guid id)
    {
        var role = await _roleService.GetRoleByIdAsync(id);

        if (role == null)
        {
            return NotFound(new { message = "Role not found." });
        }

        return Ok(role);
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    [HttpPost]
    [RequirePermission("Auth.Roles.Create")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RoleDto>> CreateRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            var role = await _roleService.CreateRoleAsync(request);
            _logger.LogInformation("Created role {RoleName}", role.Name);

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Auth.Roles.Edit")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoleDto>> UpdateRole(
        [FromRoute] Guid id,
        [FromBody] UpdateRoleRequest request)
    {
        try
        {
            var role = await _roleService.UpdateRoleAsync(id, request);
            _logger.LogInformation("Updated role {RoleName}", role.Name);

            return Ok(role);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Role not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a role
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Auth.Roles.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteRole([FromRoute] Guid id)
    {
        try
        {
            await _roleService.DeleteRoleAsync(id);
            _logger.LogInformation("Deleted role {RoleId}", id);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Role not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get role permissions
    /// </summary>
    [HttpGet("{id:guid}/permissions")]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(List<PermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<PermissionDto>>> GetRolePermissions([FromRoute] Guid id)
    {
        try
        {
            var permissions = await _roleService.GetRolePermissionsAsync(id);
            return Ok(permissions);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update role permissions
    /// </summary>
    [HttpPut("{id:guid}/permissions")]
    [RequirePermission("Auth.Roles.Edit")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoleDto>> UpdateRolePermissions(
        [FromRoute] Guid id,
        [FromBody] UpdateRolePermissionsRequest request)
    {
        try
        {
            var role = await _roleService.UpdateRolePermissionsAsync(id, request);
            _logger.LogInformation("Updated permissions for role {RoleName}", role.Name);

            return Ok(role);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Role not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if role name exists
    /// </summary>
    [HttpGet("check-name/{name}")]
    [RequirePermission("Auth.Roles.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckRoleName(
        [FromRoute] string name,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _roleService.RoleNameExistsAsync(name, excludeId);
        return Ok(new { exists });
    }
}
