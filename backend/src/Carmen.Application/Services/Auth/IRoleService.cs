using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.Auth;

/// <summary>
/// Service interface for role management
/// </summary>
public interface IRoleService
{
    /// <summary>
    /// Get paginated list of roles
    /// </summary>
    Task<PaginatedResult<RoleListDto>> GetRolesAsync(RoleQueryParams query);

    /// <summary>
    /// Get all roles for lookup (dropdown)
    /// </summary>
    Task<List<RoleLookupDto>> GetRoleLookupAsync();

    /// <summary>
    /// Get role by ID with full details
    /// </summary>
    Task<RoleDto?> GetRoleByIdAsync(Guid roleId);

    /// <summary>
    /// Create a new role
    /// </summary>
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request);

    /// <summary>
    /// Update an existing role
    /// </summary>
    Task<RoleDto> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request);

    /// <summary>
    /// Delete a role (cannot delete system roles or roles with users)
    /// </summary>
    Task DeleteRoleAsync(Guid roleId);

    /// <summary>
    /// Get permissions assigned to a role
    /// </summary>
    Task<List<PermissionDto>> GetRolePermissionsAsync(Guid roleId);

    /// <summary>
    /// Update permissions for a role
    /// </summary>
    Task<RoleDto> UpdateRolePermissionsAsync(Guid roleId, UpdateRolePermissionsRequest request);

    /// <summary>
    /// Check if role name exists
    /// </summary>
    Task<bool> RoleNameExistsAsync(string name, Guid? excludeId = null);
}
