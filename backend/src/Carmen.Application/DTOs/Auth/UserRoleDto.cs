namespace Carmen.Application.DTOs.Auth;

/// <summary>
/// User's roles summary
/// </summary>
public record UserRolesDto(
    Guid UserId,
    string Email,
    string FullName,
    List<RoleLookupDto> Roles
);

/// <summary>
/// Request to update user roles
/// </summary>
public record UpdateUserRolesRequest(
    List<Guid> RoleIds
);
