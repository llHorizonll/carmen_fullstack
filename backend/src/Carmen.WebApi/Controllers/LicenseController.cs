using Carmen.Application.DTOs.Settings;
using Carmen.Application.Services.Settings;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// License and subscription management endpoints
/// </summary>
[ApiController]
[Route("api/v1/settings/license")]
[Authorize]
public class LicenseController : ControllerBase
{
    private readonly ILicenseService _licenseService;
    private readonly ILogger<LicenseController> _logger;

    public LicenseController(
        ILicenseService licenseService,
        ILogger<LicenseController> logger)
    {
        _licenseService = licenseService;
        _logger = logger;
    }

    /// <summary>
    /// Get current tenant license information
    /// </summary>
    [HttpGet]
    [RequirePermission("Settings.License.View")]
    [ProducesResponseType(typeof(LicenseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LicenseDto>> GetLicenseInfo()
    {
        try
        {
            var license = await _licenseService.GetLicenseInfoAsync();
            return Ok(license);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to get license info: {Message}", ex.Message);
            return NotFound(new { message = ex.Message });
        }
    }
}
