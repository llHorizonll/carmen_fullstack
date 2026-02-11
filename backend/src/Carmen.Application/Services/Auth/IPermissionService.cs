using Carmen.Application.DTOs.Auth;

namespace Carmen.Application.Services.Auth;

/// <summary>
/// Service interface for permission management
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Get all available permissions
    /// </summary>
    Task<List<PermissionDto>> GetAllPermissionsAsync();

    /// <summary>
    /// Get permissions grouped by module
    /// </summary>
    Task<List<PermissionGroupDto>> GetPermissionsGroupedByModuleAsync();

    /// <summary>
    /// Get permission by code
    /// </summary>
    Task<PermissionDto?> GetPermissionByCodeAsync(string code);
}
