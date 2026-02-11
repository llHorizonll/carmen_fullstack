using Carmen.Application.DTOs.Settings;

namespace Carmen.Application.Services.Settings;

/// <summary>
/// Service interface for license and subscription management
/// </summary>
public interface ILicenseService
{
    /// <summary>
    /// Get current tenant license information
    /// </summary>
    Task<LicenseDto> GetLicenseInfoAsync();
}
