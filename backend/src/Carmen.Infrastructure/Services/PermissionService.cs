using Carmen.Application.DTOs.Auth;
using Carmen.Application.Services.Auth;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class PermissionService : IPermissionService
{
    private readonly CarmenDbContext _context;

    public PermissionService(CarmenDbContext context)
    {
        _context = context;
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Code)
            .Select(p => new PermissionDto(
                p.Id,
                p.Code,
                p.Name,
                p.Module,
                p.Description
            ))
            .ToListAsync();
    }

    public async Task<List<PermissionGroupDto>> GetPermissionsGroupedByModuleAsync()
    {
        var permissions = await GetAllPermissionsAsync();

        return permissions
            .GroupBy(p => p.Module)
            .OrderBy(g => g.Key)
            .Select(g => new PermissionGroupDto(
                Module: g.Key,
                Permissions: g.ToList()
            ))
            .ToList();
    }

    public async Task<PermissionDto?> GetPermissionByCodeAsync(string code)
    {
        var permission = await _context.Permissions
            .FirstOrDefaultAsync(p => p.Code == code);

        if (permission == null) return null;

        return new PermissionDto(
            permission.Id,
            permission.Code,
            permission.Name,
            permission.Module,
            permission.Description
        );
    }
}
