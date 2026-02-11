using Carmen.Application.DTOs.Auth;

namespace Carmen.Application.Services.Auth;

/// <summary>
/// Service interface for user-role assignments
/// </summary>
public interface IUserRoleService
{
    /// <summary>
    /// Get roles assigned to a user
    /// </summary>
    Task<UserRolesDto?> GetUserRolesAsync(Guid userId);

    /// <summary>
    /// Update roles for a user
    /// </summary>
    Task<UserRolesDto> UpdateUserRolesAsync(Guid userId, UpdateUserRolesRequest request);
}
