using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Services.Configuration;
using Carmen.Domain.Entities.Configuration;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Tax Profile management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/tax-profiles")]
[Authorize]
public class TaxProfilesController : ControllerBase
{
    private readonly ITaxProfileService _taxProfileService;
    private readonly ILogger<TaxProfilesController> _logger;

    public TaxProfilesController(
        ITaxProfileService taxProfileService,
        ILogger<TaxProfilesController> logger)
    {
        _taxProfileService = taxProfileService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of tax profiles
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="search">Search term for code/name</param>
    /// <param name="taxType">Filter by tax type</param>
    /// <param name="isActive">Filter by active status</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <param name="sortBy">Sort field (default: TaxCode)</param>
    /// <param name="sortDescending">Sort descending (default: false)</param>
    [HttpGet]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(PaginatedResult<TaxProfileListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<TaxProfileListDto>>> GetTaxProfiles(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] TaxType? taxType,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "TaxCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new TaxProfileQueryParams(
            Search: search,
            TaxType: taxType,
            IsActive: isActive,
            Page: page,
            PageSize: Math.Min(pageSize, 100), // Max 100 items per page
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _taxProfileService.GetTaxProfilesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get tax profile by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(TaxProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaxProfileDto>> GetTaxProfile(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var taxProfile = await _taxProfileService.GetTaxProfileByIdAsync(id);

        if (taxProfile == null)
        {
            return NotFound(new { message = "Tax profile not found." });
        }

        return Ok(taxProfile);
    }

    /// <summary>
    /// Get tax profile by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(TaxProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaxProfileDto>> GetTaxProfileByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code)
    {
        var taxProfile = await _taxProfileService.GetTaxProfileByCodeAsync(code);

        if (taxProfile == null)
        {
            return NotFound(new { message = "Tax profile not found." });
        }

        return Ok(taxProfile);
    }

    /// <summary>
    /// Get tax profiles for lookup (dropdown/select)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(List<TaxProfileLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TaxProfileLookupDto>>> GetTaxProfileLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] bool? isActive)
    {
        var taxProfiles = await _taxProfileService.GetTaxProfileLookupAsync(isActive);
        return Ok(taxProfiles);
    }

    /// <summary>
    /// Create a new tax profile
    /// </summary>
    [HttpPost]
    [RequirePermission("Configuration.TaxProfile.Create")]
    [ProducesResponseType(typeof(TaxProfileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaxProfileDto>> CreateTaxProfile(
        [FromRoute] Guid tenantId,
        [FromBody] CreateTaxProfileRequest request)
    {
        try
        {
            var taxProfile = await _taxProfileService.CreateTaxProfileAsync(request);
            _logger.LogInformation("Created tax profile {TaxCode} for tenant {TenantId}",
                taxProfile.TaxCode, tenantId);

            return CreatedAtAction(
                nameof(GetTaxProfile),
                new { tenantId, id = taxProfile.Id },
                taxProfile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create tax profile: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing tax profile
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Configuration.TaxProfile.Edit")]
    [ProducesResponseType(typeof(TaxProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaxProfileDto>> UpdateTaxProfile(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateTaxProfileRequest request)
    {
        try
        {
            var taxProfile = await _taxProfileService.UpdateTaxProfileAsync(id, request);
            _logger.LogInformation("Updated tax profile {TaxCode} for tenant {TenantId}",
                taxProfile.TaxCode, tenantId);

            return Ok(taxProfile);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Tax profile not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update tax profile {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a tax profile (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Configuration.TaxProfile.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteTaxProfile(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _taxProfileService.DeleteTaxProfileAsync(id);
            _logger.LogInformation("Deleted tax profile {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Tax profile not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete tax profile {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if tax code exists
    /// </summary>
    [HttpGet("check-code/{code}")]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckTaxCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _taxProfileService.TaxCodeExistsAsync(code, excludeId);
        return Ok(new { exists });
    }

    /// <summary>
    /// Check if tax profile has transactions
    /// </summary>
    [HttpGet("{id:guid}/has-transactions")]
    [RequirePermission("Configuration.TaxProfile.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckTaxProfileHasTransactions(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var hasTransactions = await _taxProfileService.TaxProfileHasTransactionsAsync(id);
        return Ok(new { hasTransactions });
    }
}
