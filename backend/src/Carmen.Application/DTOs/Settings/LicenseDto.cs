namespace Carmen.Application.DTOs.Settings;

/// <summary>
/// License and subscription information for a tenant
/// </summary>
public record LicenseDto(
    string SubscriptionPlan,
    string SubscriptionStatus,      // Active, Expired, Trial, Suspended
    DateTime? SubscriptionExpiresAt,
    int MaxUsers,
    int CurrentUsers,
    int MaxAccounts,
    int CurrentAccounts,
    bool IsTrialMode,
    DateTime? TrialEndsAt,
    int DaysRemaining
);
