using Carmen.Application.DTOs.Settings;
using Carmen.Application.Services.Settings;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Tenant settings management endpoints
/// </summary>
[ApiController]
[Route("api/v1/settings/tenant")]
[Authorize]
public class TenantSettingsController : ControllerBase
{
    private readonly ITenantSettingsService _tenantSettingsService;
    private readonly ILogger<TenantSettingsController> _logger;

    public TenantSettingsController(
        ITenantSettingsService tenantSettingsService,
        ILogger<TenantSettingsController> logger)
    {
        _tenantSettingsService = tenantSettingsService;
        _logger = logger;
    }

    /// <summary>
    /// Get current tenant settings
    /// </summary>
    [HttpGet]
    [RequirePermission("Settings.Company.View")]
    [ProducesResponseType(typeof(TenantSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantSettingsDto>> GetTenantSettings()
    {
        var settings = await _tenantSettingsService.GetTenantSettingsAsync();

        if (settings == null)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        return Ok(settings);
    }

    /// <summary>
    /// Update tenant settings
    /// </summary>
    [HttpPut]
    [RequirePermission("Settings.Company.Edit")]
    [ProducesResponseType(typeof(TenantSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TenantSettingsDto>> UpdateTenantSettings(
        [FromBody] UpdateTenantSettingsRequest request)
    {
        try
        {
            var settings = await _tenantSettingsService.UpdateTenantSettingsAsync(request);
            _logger.LogInformation("Updated tenant settings for tenant {TenantId}", settings.Id);

            return Ok(settings);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Tenant not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update tenant settings: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }
}
