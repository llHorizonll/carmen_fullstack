namespace Carmen.Application.DTOs.Auth;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    Guid? TenantId,
    string? TenantName,
    string? TenantCode,
    List<string> Roles,
    List<string> Permissions,
    List<TenantSummaryDto> AccessibleTenants
);

/// <summary>
/// Summary of a tenant for multi-tenant user selection
/// </summary>
public record TenantSummaryDto(
    Guid Id,
    string Code,
    string Name,
    string BaseCurrency
);

/// <summary>
/// User list item DTO for paginated listing
/// </summary>
public record UserListDto(
    Guid Id,
    string Email,
    string FullName,
    bool IsActive,
    int RoleCount,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);

/// <summary>
/// User detail DTO with full information including roles
/// </summary>
public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? Phone,
    string PreferredLanguage,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    List<RoleLookupDto> Roles
);

/// <summary>
/// Query parameters for user listing
/// </summary>
public class UserQueryParams
{
    public string? Search { get; init; }
    public bool? IsActive { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string SortBy { get; init; } = "Email";
    public bool SortDescending { get; init; } = false;
}
