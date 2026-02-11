namespace Carmen.Application.DTOs.Auth;

/// <summary>
/// Role data transfer object with full details
/// </summary>
public record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    int UserCount,
    List<string> Permissions,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt,
    string? UpdatedBy
);

/// <summary>
/// Role list item (lighter for lists)
/// </summary>
public record RoleListDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    int UserCount,
    int PermissionCount
);

/// <summary>
/// Role for dropdown/lookup
/// </summary>
public record RoleLookupDto(
    Guid Id,
    string Name
);

/// <summary>
/// Request to create a new role
/// </summary>
public record CreateRoleRequest(
    string Name,
    string? Description,
    List<Guid>? PermissionIds
);

/// <summary>
/// Request to update an existing role
/// </summary>
public record UpdateRoleRequest(
    string Name,
    string? Description
);

/// <summary>
/// Request to update role permissions
/// </summary>
public record UpdateRolePermissionsRequest(
    List<Guid> PermissionIds
);

/// <summary>
/// Query parameters for roles
/// </summary>
public record RoleQueryParams(
    string? Search,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    bool SortDescending = false
);
