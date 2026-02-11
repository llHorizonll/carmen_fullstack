using Carmen.Application.DTOs.Settings;

namespace Carmen.Application.Services.Settings;

/// <summary>
/// Service interface for tenant settings management
/// </summary>
public interface ITenantSettingsService
{
    /// <summary>
    /// Get current tenant settings
    /// </summary>
    Task<TenantSettingsDto?> GetTenantSettingsAsync();

    /// <summary>
    /// Update tenant settings
    /// </summary>
    Task<TenantSettingsDto> UpdateTenantSettingsAsync(UpdateTenantSettingsRequest request);
}
