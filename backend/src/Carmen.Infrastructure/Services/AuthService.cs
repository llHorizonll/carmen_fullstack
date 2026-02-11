using Carmen.Application.DTOs.Auth;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Auth;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly CarmenDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly int _refreshTokenExpiryDays = 7;

    public AuthService(
        CarmenDbContext context,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Query 1: Get user with primary tenant
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is disabled");
        }

        if (user.LockoutEndAt.HasValue && user.LockoutEndAt > DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Account is locked. Please try again later.");
        }

        // Query 2, 3, 4: Get roles, permissions, and accessible tenants in parallel
        var rolesTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Name)
            .ToListAsync();

        var permissionsTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync();

        var accessibleTenantsTask = GetAccessibleTenantsAsync(user);

        await Task.WhenAll(rolesTask, permissionsTask, accessibleTenantsTask);

        var roles = rolesTask.Result;
        var permissions = permissionsTask.Result;
        var accessibleTenants = accessibleTenantsTask.Result;

        // Determine the active tenant
        Tenant? activeTenant = null;
        if (!string.IsNullOrEmpty(request.TenantCode))
        {
            // User specified a tenant code - validate access
            activeTenant = accessibleTenants.FirstOrDefault(t => t.Code == request.TenantCode);
            if (activeTenant == null)
            {
                throw new UnauthorizedAccessException($"Access denied to tenant: {request.TenantCode}");
            }
        }
        else if (accessibleTenants.Count == 1)
        {
            // Only one tenant - use it automatically
            activeTenant = accessibleTenants.First();
        }
        else if (user.Tenant != null)
        {
            // Use primary tenant as default
            activeTenant = user.Tenant;
        }
        // If no tenant (system admin with no default), activeTenant remains null

        // Generate tokens with active tenant context
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles, permissions, activeTenant);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.Email
        };

        _context.RefreshTokens.Add(refreshTokenEntity);

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        user.FailedLoginAttempts = 0;

        await _context.SaveChangesAsync();

        return new LoginResponse(
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            ExpiresAt: DateTime.UtcNow.AddMinutes(480), // Should match JWT expiry
            User: MapToUserDto(user, activeTenant, roles, permissions, accessibleTenants)
        );
    }

    /// <summary>
    /// Gets the list of tenants a user can access (primary + additional group access)
    /// </summary>
    private async Task<List<Tenant>> GetAccessibleTenantsAsync(User user)
    {
        var tenants = new List<Tenant>();

        // Add primary tenant if exists
        if (user.Tenant != null)
        {
            tenants.Add(user.Tenant);
        }

        // Get additional tenants from GroupTenantAccess
        var additionalTenants = await _context.GroupTenantAccesses
            .Where(gta => gta.UserId == user.Id)
            .Select(gta => gta.Tenant)
            .ToListAsync();

        foreach (var tenant in additionalTenants)
        {
            if (tenant != null && !tenants.Any(t => t.Id == tenant.Id))
            {
                tenants.Add(tenant);
            }
        }

        return tenants;
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        // Query 1: Get refresh token with user and tenant
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Tenant)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = refreshToken.User;

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is disabled");
        }

        // Query 2, 3, 4: Get roles, permissions, and accessible tenants in parallel
        var rolesTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Name)
            .ToListAsync();

        var permissionsTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync();

        var accessibleTenantsTask = GetAccessibleTenantsAsync(user);

        await Task.WhenAll(rolesTask, permissionsTask, accessibleTenantsTask);

        var roles = rolesTask.Result;
        var permissions = permissionsTask.Result;
        var accessibleTenants = accessibleTenantsTask.Result;

        // Use primary tenant as active tenant for refresh
        var activeTenant = user.Tenant;

        // Revoke old refresh token
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;

        // Generate new tokens
        var newAccessToken = _jwtTokenService.GenerateAccessToken(user, roles, permissions, activeTenant);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save new refresh token
        var newRefreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpiryDays),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.Email
        };

        refreshToken.ReplacedByToken = newRefreshToken;
        _context.RefreshTokens.Add(newRefreshTokenEntity);

        await _context.SaveChangesAsync();

        return new LoginResponse(
            AccessToken: newAccessToken,
            RefreshToken: newRefreshToken,
            ExpiresAt: DateTime.UtcNow.AddMinutes(480),
            User: MapToUserDto(user, activeTenant, roles, permissions, accessibleTenants)
        );
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        // Check if email exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            TenantId = request.TenantId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        _context.Users.Add(user);

        // Add roles if provided
        if (request.RoleIds != null && request.RoleIds.Any())
        {
            foreach (var roleId in request.RoleIds)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId
                });
            }
        }

        await _context.SaveChangesAsync();

        // Reload user with tenant
        var createdUser = await _context.Users
            .Include(u => u.Tenant)
            .FirstAsync(u => u.Id == user.Id);

        // Get roles, permissions, and accessible tenants in parallel
        var rolesTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.Role.Name)
            .ToListAsync();

        var permissionsTask = _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync();

        var accessibleTenantsTask = GetAccessibleTenantsAsync(createdUser);

        await Task.WhenAll(rolesTask, permissionsTask, accessibleTenantsTask);

        return MapToUserDto(createdUser, createdUser.Tenant, rolesTask.Result, permissionsTask.Result, accessibleTenantsTask.Result);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        // Query 1: Get user with tenant
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Query 2, 3, 4: Get roles, permissions, and accessible tenants in parallel
        var rolesTask = _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.Role.Name)
            .ToListAsync();

        var permissionsTask = _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync();

        var accessibleTenantsTask = GetAccessibleTenantsAsync(user);

        await Task.WhenAll(rolesTask, permissionsTask, accessibleTenantsTask);

        return MapToUserDto(user, user.Tenant, rolesTask.Result, permissionsTask.Result, accessibleTenantsTask.Result);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.Token == refreshToken);

        if (token != null)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static UserDto MapToUserDto(
        User user,
        Tenant? activeTenant,
        List<string> roles,
        List<string> permissions,
        List<Tenant> accessibleTenants)
    {
        return new UserDto(
            Id: user.Id,
            Email: user.Email,
            FirstName: user.FirstName,
            LastName: user.LastName,
            FullName: user.FullName,
            TenantId: activeTenant?.Id,
            TenantName: activeTenant?.Name,
            TenantCode: activeTenant?.Code,
            Roles: roles,
            Permissions: permissions,
            AccessibleTenants: accessibleTenants.Select(t => new TenantSummaryDto(
                Id: t.Id,
                Code: t.Code,
                Name: t.Name,
                BaseCurrency: t.BaseCurrency
            )).ToList()
        );
    }
}
