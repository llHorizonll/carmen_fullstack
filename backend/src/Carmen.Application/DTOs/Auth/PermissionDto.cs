namespace Carmen.Application.DTOs.Auth;

/// <summary>
/// Permission data transfer object
/// </summary>
public record PermissionDto(
    Guid Id,
    string Code,
    string Name,
    string Module,
    string? Description
);

/// <summary>
/// Grouped permissions by module for UI display
/// </summary>
public record PermissionGroupDto(
    string Module,
    List<PermissionDto> Permissions
);
