using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Auth;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly CarmenDbContext _context;

    public UserService(CarmenDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<UserListDto>> GetUsersAsync(UserQueryParams query)
    {
        var queryable = _context.Users.AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(u =>
                u.Email.ToLower().Contains(search) ||
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        // Active filter
        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(u => u.IsActive == query.IsActive.Value);
        }

        var totalCount = await queryable.CountAsync();

        // Sorting
        queryable = query.SortBy.ToLower() switch
        {
            "fullname" => query.SortDescending
                ? queryable.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.LastName)
                : queryable.OrderBy(u => u.FirstName).ThenBy(u => u.LastName),
            "lastloginat" => query.SortDescending
                ? queryable.OrderByDescending(u => u.LastLoginAt)
                : queryable.OrderBy(u => u.LastLoginAt),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(u => u.CreatedAt)
                : queryable.OrderBy(u => u.CreatedAt),
            "isactive" => query.SortDescending
                ? queryable.OrderByDescending(u => u.IsActive)
                : queryable.OrderBy(u => u.IsActive),
            _ => query.SortDescending
                ? queryable.OrderByDescending(u => u.Email)
                : queryable.OrderBy(u => u.Email)
        };

        var users = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new UserListDto(
                u.Id,
                u.Email,
                u.FullName,
                u.IsActive,
                u.UserRoles.Count,
                u.LastLoginAt,
                u.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<UserListDto>(users, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<UserDetailDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return new UserDetailDto(
            Id: user.Id,
            Email: user.Email,
            FirstName: user.FirstName,
            LastName: user.LastName,
            FullName: user.FullName,
            Phone: user.Phone,
            PreferredLanguage: user.PreferredLanguage,
            IsActive: user.IsActive,
            LastLoginAt: user.LastLoginAt,
            CreatedAt: user.CreatedAt,
            Roles: user.UserRoles.Select(ur => new RoleLookupDto(
                ur.Role.Id,
                ur.Role.Name
            )).ToList()
        );
    }
}
