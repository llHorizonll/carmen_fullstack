using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Auth;

/// <summary>
/// Represents a tenant (hotel property) in the system
/// </summary>
public class Tenant : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? TaxId { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string BaseCurrency { get; set; } = "USD";
    public string DefaultLanguage { get; set; } = "en";
    public string TimeZone { get; set; } = "UTC";
    public bool IsActive { get; set; } = true;
    public DateTime? SubscriptionExpiresAt { get; set; }

    // Subscription/License fields
    public string SubscriptionPlan { get; set; } = "Free";  // Free, Professional, Enterprise
    public int MaxUsers { get; set; } = 5;                   // User limit
    public int MaxAccounts { get; set; } = 100;              // Chart of accounts limit
    public bool IsTrialMode { get; set; } = false;
    public DateTime? TrialEndsAt { get; set; }

    // Navigation properties
    public virtual ICollection<User> Users { get; set; } = new List<User>();

    // Users with additional access to this tenant (Group Admins)
    public virtual ICollection<GroupTenantAccess> GroupTenantAccesses { get; set; } = new List<GroupTenantAccess>();
}
