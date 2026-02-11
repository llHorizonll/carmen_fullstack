using Carmen.Application.DTOs.Auth;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Auth;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RoleService(CarmenDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedResult<RoleListDto>> GetRolesAsync(RoleQueryParams query)
    {
        var queryable = _context.Roles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(r =>
                r.Name.ToLower().Contains(search) ||
                (r.Description != null && r.Description.ToLower().Contains(search)));
        }

        var totalCount = await queryable.CountAsync();

        queryable = query.SortBy.ToLower() switch
        {
            "description" => query.SortDescending
                ? queryable.OrderByDescending(r => r.Description)
                : queryable.OrderBy(r => r.Description),
            _ => query.SortDescending
                ? queryable.OrderByDescending(r => r.Name)
                : queryable.OrderBy(r => r.Name)
        };

        var roles = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(r => new RoleListDto(
                r.Id,
                r.Name,
                r.Description,
                r.IsSystemRole,
                r.UserRoles.Count,
                r.RolePermissions.Count
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<RoleListDto>(roles, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<List<RoleLookupDto>> GetRoleLookupAsync()
    {
        return await _context.Roles
            .OrderBy(r => r.Name)
            .Select(r => new RoleLookupDto(r.Id, r.Name))
            .ToListAsync();
    }

    public async Task<RoleDto?> GetRoleByIdAsync(Guid roleId)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null) return null;

        return MapToRoleDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest request)
    {
        if (await RoleNameExistsAsync(request.Name))
        {
            throw new InvalidOperationException($"Role with name '{request.Name}' already exists.");
        }

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsSystemRole = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Roles.Add(role);

        if (request.PermissionIds != null && request.PermissionIds.Any())
        {
            foreach (var permissionId in request.PermissionIds)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permissionId
                });
            }
        }

        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(role.Id))!;
    }

    public async Task<RoleDto> UpdateRoleAsync(Guid roleId, UpdateRoleRequest request)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        if (role.IsSystemRole)
        {
            throw new InvalidOperationException("Cannot modify a system role.");
        }

        if (await RoleNameExistsAsync(request.Name, roleId))
        {
            throw new InvalidOperationException($"Role with name '{request.Name}' already exists.");
        }

        role.Name = request.Name;
        role.Description = request.Description;
        role.UpdatedAt = DateTime.UtcNow;
        role.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(roleId))!;
    }

    public async Task DeleteRoleAsync(Guid roleId)
    {
        var role = await _context.Roles
            .Include(r => r.UserRoles)
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        if (role.IsSystemRole)
        {
            throw new InvalidOperationException("Cannot delete a system role.");
        }

        if (role.UserRoles.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete role. It is assigned to {role.UserRoles.Count} user(s).");
        }

        _context.RolePermissions.RemoveRange(role.RolePermissions);
        _context.Roles.Remove(role);

        await _context.SaveChangesAsync();
    }

    public async Task<List<PermissionDto>> GetRolePermissionsAsync(Guid roleId)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        return role.RolePermissions
            .Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Code,
                rp.Permission.Name,
                rp.Permission.Module,
                rp.Permission.Description
            ))
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Code)
            .ToList();
    }

    public async Task<RoleDto> UpdateRolePermissionsAsync(Guid roleId, UpdateRolePermissionsRequest request)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == roleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        if (role.IsSystemRole && role.Name == "Admin")
        {
            throw new InvalidOperationException("Cannot modify Admin role permissions.");
        }

        _context.RolePermissions.RemoveRange(role.RolePermissions);

        foreach (var permissionId in request.PermissionIds)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            });
        }

        role.UpdatedAt = DateTime.UtcNow;
        role.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(roleId))!;
    }

    public async Task<bool> RoleNameExistsAsync(string name, Guid? excludeId = null)
    {
        var query = _context.Roles.Where(r => r.Name == name);

        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    private static RoleDto MapToRoleDto(Role role)
    {
        return new RoleDto(
            Id: role.Id,
            Name: role.Name,
            Description: role.Description,
            IsSystemRole: role.IsSystemRole,
            UserCount: role.UserRoles.Count,
            Permissions: role.RolePermissions.Select(rp => rp.Permission.Code).ToList(),
            CreatedAt: role.CreatedAt,
            CreatedBy: role.CreatedBy,
            UpdatedAt: role.UpdatedAt,
            UpdatedBy: role.UpdatedBy
        );
    }
}
