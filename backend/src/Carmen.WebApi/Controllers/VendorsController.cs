using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AP;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Vendor management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/vendors")]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorsController> _logger;

    public VendorsController(
        IVendorService vendorService,
        ILogger<VendorsController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of vendors
    /// </summary>
    [HttpGet]
    [RequirePermission("AP.Vendor.View")]
    [ProducesResponseType(typeof(PaginatedResult<VendorListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<VendorListDto>>> GetVendors(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "VendorCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new VendorQueryParams(
            Search: search,
            IsActive: isActive,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _vendorService.GetVendorsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get vendor by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AP.Vendor.View")]
    [ProducesResponseType(typeof(VendorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendorDto>> GetVendor(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(id);

        if (vendor == null)
        {
            return NotFound(new { message = "Vendor not found." });
        }

        return Ok(vendor);
    }

    /// <summary>
    /// Get vendor by code
    /// </summary>
    [HttpGet("by-code/{vendorCode}")]
    [RequirePermission("AP.Vendor.View")]
    [ProducesResponseType(typeof(VendorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendorDto>> GetVendorByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string vendorCode)
    {
        var vendor = await _vendorService.GetVendorByCodeAsync(vendorCode);

        if (vendor == null)
        {
            return NotFound(new { message = "Vendor not found." });
        }

        return Ok(vendor);
    }

    /// <summary>
    /// Get vendor lookup list for dropdowns
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("AP.Vendor.View")]
    [ProducesResponseType(typeof(List<VendorLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<VendorLookupDto>>> GetVendorLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search)
    {
        var result = await _vendorService.GetVendorLookupAsync(search);
        return Ok(result);
    }

    /// <summary>
    /// Create a new vendor
    /// </summary>
    [HttpPost]
    [RequirePermission("AP.Vendor.Create")]
    [ProducesResponseType(typeof(VendorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VendorDto>> CreateVendor(
        [FromRoute] Guid tenantId,
        [FromBody] CreateVendorRequest request)
    {
        try
        {
            var vendor = await _vendorService.CreateVendorAsync(request);
            _logger.LogInformation("Created vendor {VendorCode} for tenant {TenantId}",
                vendor.VendorCode, tenantId);

            return CreatedAtAction(
                nameof(GetVendor),
                new { tenantId, id = vendor.Id },
                vendor);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create vendor: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing vendor
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AP.Vendor.Edit")]
    [ProducesResponseType(typeof(VendorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendorDto>> UpdateVendor(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateVendorRequest request)
    {
        try
        {
            var vendor = await _vendorService.UpdateVendorAsync(id, request);
            _logger.LogInformation("Updated vendor {VendorCode} for tenant {TenantId}",
                vendor.VendorCode, tenantId);

            return Ok(vendor);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Vendor not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update vendor {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a vendor
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AP.Vendor.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteVendor(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _vendorService.DeleteVendorAsync(id);
            _logger.LogInformation("Deleted vendor {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Vendor not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete vendor {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get vendor aging detail
    /// </summary>
    [HttpGet("{id:guid}/aging")]
    [RequirePermission("AP.Report.View")]
    [ProducesResponseType(typeof(VendorAgingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VendorAgingDto>> GetVendorAging(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromQuery] DateTime? asOfDate)
    {
        try
        {
            var aging = await _vendorService.GetVendorAgingAsync(id, asOfDate ?? DateTime.Today);
            return Ok(aging);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Vendor not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get aging report for all vendors
    /// </summary>
    [HttpGet("aging-report")]
    [RequirePermission("AP.Report.View")]
    [ProducesResponseType(typeof(List<VendorAgingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<VendorAgingSummaryDto>>> GetAgingReport(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? asOfDate)
    {
        var result = await _vendorService.GetAgingReportAsync(asOfDate ?? DateTime.Today);
        return Ok(result);
    }

    /// <summary>
    /// Check if vendor code is unique
    /// </summary>
    [HttpGet("check-code/{vendorCode}")]
    [RequirePermission("AP.Vendor.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckVendorCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string vendorCode,
        [FromQuery] Guid? excludeId)
    {
        var isUnique = await _vendorService.IsVendorCodeUniqueAsync(vendorCode, excludeId);
        return Ok(new { isUnique });
    }
}
