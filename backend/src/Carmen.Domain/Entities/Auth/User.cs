using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Auth;

/// <summary>
/// Represents a user in the system
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PreferredLanguage { get; set; } = "en";
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEndAt { get; set; }

    // Tenant association (null for system admins)
    public Guid? TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }

    // Roles
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    // Refresh tokens
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    // Additional tenant access for Group Admins
    public virtual ICollection<GroupTenantAccess> AccessibleTenants { get; set; } = new List<GroupTenantAccess>();

    public string FullName => $"{FirstName} {LastName}".Trim();
}
