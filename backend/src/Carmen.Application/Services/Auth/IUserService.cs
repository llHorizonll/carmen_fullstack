using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.Auth;

/// <summary>
/// Service interface for user management operations
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Get paginated list of users
    /// </summary>
    Task<PaginatedResult<UserListDto>> GetUsersAsync(UserQueryParams queryParams);

    /// <summary>
    /// Get user details by ID
    /// </summary>
    Task<UserDetailDto?> GetUserByIdAsync(Guid id);
}
