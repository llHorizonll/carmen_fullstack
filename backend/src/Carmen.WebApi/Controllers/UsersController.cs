using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Auth;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// User management endpoints
/// </summary>
[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IUserRoleService _userRoleService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        IUserRoleService userRoleService,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _userRoleService = userRoleService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of users
    /// </summary>
    [HttpGet]
    [RequirePermission("Users.View")]
    [ProducesResponseType(typeof(PaginatedResult<UserListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<UserListDto>>> GetUsers([FromQuery] UserQueryParams query)
    {
        var result = await _userService.GetUsersAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get user details by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Users.View")]
    [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDetailDto>> GetUser([FromRoute] Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(user);
    }

    /// <summary>
    /// Get user roles
    /// </summary>
    [HttpGet("{id:guid}/roles")]
    [RequirePermission("Users.View")]
    [ProducesResponseType(typeof(UserRolesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserRolesDto>> GetUserRoles([FromRoute] Guid id)
    {
        var userRoles = await _userRoleService.GetUserRolesAsync(id);

        if (userRoles == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(userRoles);
    }

    /// <summary>
    /// Update user roles
    /// </summary>
    [HttpPut("{id:guid}/roles")]
    [RequirePermission("Users.Edit")]
    [ProducesResponseType(typeof(UserRolesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserRolesDto>> UpdateUserRoles(
        [FromRoute] Guid id,
        [FromBody] UpdateUserRolesRequest request)
    {
        try
        {
            var userRoles = await _userRoleService.UpdateUserRolesAsync(id, request);
            _logger.LogInformation("Updated roles for user {UserId}", id);

            return Ok(userRoles);
        }
        catch (InvalidOperationException ex) when (ex.Message == "User not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
