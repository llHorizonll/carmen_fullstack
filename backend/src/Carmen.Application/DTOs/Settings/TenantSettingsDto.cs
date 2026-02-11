namespace Carmen.Application.DTOs.Settings;

/// <summary>
/// Tenant settings data transfer object
/// </summary>
public record TenantSettingsDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? Email,
    string? TaxId,
    string? Website,
    string BaseCurrency,
    string DefaultLanguage,
    string TimeZone,
    string? LogoUrl,
    bool IsActive,
    DateTime? SubscriptionExpiresAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

/// <summary>
/// Request to update tenant settings
/// </summary>
public record UpdateTenantSettingsRequest(
    string Name,
    string? Description,
    string? Address,
    string? Phone,
    string? Email,
    string? TaxId,
    string? Website,
    string BaseCurrency,
    string DefaultLanguage,
    string TimeZone,
    string? LogoUrl
);
