using Carmen.Application.DTOs.Auth;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Auth;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class UserRoleService : IUserRoleService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UserRoleService(CarmenDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserRolesDto?> GetUserRolesAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserRolesDto(
            UserId: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            Roles: user.UserRoles.Select(ur => new RoleLookupDto(
                ur.Role.Id,
                ur.Role.Name
            )).ToList()
        );
    }

    public async Task<UserRolesDto> UpdateUserRolesAsync(Guid userId, UpdateUserRolesRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Remove existing user roles
        _context.UserRoles.RemoveRange(user.UserRoles);

        // Add new roles
        foreach (var roleId in request.RoleIds)
        {
            _context.UserRoles.Add(new UserRole
            {
                UserId = userId,
                RoleId = roleId
            });
        }

        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        return (await GetUserRolesAsync(userId))!;
    }
}
