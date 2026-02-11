using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Auth;

/// <summary>
/// Represents a role in the system
/// </summary>
public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

/// <summary>
/// Represents a permission in the system
/// </summary>
public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

/// <summary>
/// Many-to-many relationship between User and Role
/// </summary>
public class UserRole
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;
}

/// <summary>
/// Many-to-many relationship between Role and Permission
/// </summary>
public class RolePermission
{
    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public virtual Permission Permission { get; set; } = null!;
}

/// <summary>
/// Many-to-many relationship between User and Tenant for Group Admin access
/// Allows users (especially Group Admins) to access multiple tenants
/// </summary>
public class GroupTenantAccess
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedBy { get; set; }
}
