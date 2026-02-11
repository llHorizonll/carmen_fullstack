using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Asset;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Asset depreciation management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/depreciation")]
[Authorize]
public class DepreciationController : ControllerBase
{
    private readonly IDepreciationService _depreciationService;
    private readonly IAssetService _assetService;
    private readonly ILogger<DepreciationController> _logger;

    public DepreciationController(
        IDepreciationService depreciationService,
        IAssetService assetService,
        ILogger<DepreciationController> logger)
    {
        _depreciationService = depreciationService;
        _assetService = assetService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of depreciation schedules
    /// </summary>
    [HttpGet("schedules")]
    [RequirePermission("Asset.Depreciation.View")]
    [ProducesResponseType(typeof(PaginatedResult<DepreciationScheduleListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<DepreciationScheduleListDto>>> GetSchedules(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid? assetId,
        [FromQuery] Guid? fiscalPeriodId,
        [FromQuery] bool? isPosted,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "ScheduleDate",
        [FromQuery] bool sortDescending = false)
    {
        var query = new DepreciationQueryParams(
            AssetId: assetId,
            FiscalPeriodId: fiscalPeriodId,
            IsPosted: isPosted,
            DateFrom: dateFrom,
            DateTo: dateTo,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _depreciationService.GetSchedulesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get depreciation schedule by ID
    /// </summary>
    [HttpGet("schedules/{id:guid}")]
    [RequirePermission("Asset.Depreciation.View")]
    [ProducesResponseType(typeof(DepreciationScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepreciationScheduleDto>> GetSchedule(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var schedule = await _depreciationService.GetScheduleByIdAsync(id);

        if (schedule == null)
        {
            return NotFound(new { message = "Depreciation schedule not found." });
        }

        return Ok(schedule);
    }

    /// <summary>
    /// Get all depreciation schedules for an asset
    /// </summary>
    [HttpGet("by-asset/{assetId:guid}")]
    [RequirePermission("Asset.Depreciation.View")]
    [ProducesResponseType(typeof(List<DepreciationScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DepreciationScheduleDto>>> GetSchedulesByAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid assetId)
    {
        var asset = await _assetService.GetAssetByIdAsync(assetId);
        if (asset == null)
        {
            return NotFound(new { message = "Asset not found." });
        }

        var schedules = await _depreciationService.GetSchedulesByAssetAsync(assetId);
        return Ok(schedules);
    }

    /// <summary>
    /// Generate depreciation schedule for an asset
    /// </summary>
    [HttpPost("generate/{assetId:guid}")]
    [RequirePermission("Asset.Depreciation.Run")]
    [ProducesResponseType(typeof(List<DepreciationScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DepreciationScheduleDto>>> GenerateSchedule(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid assetId)
    {
        try
        {
            var schedules = await _depreciationService.GenerateScheduleAsync(assetId);
            _logger.LogInformation("Generated depreciation schedule for asset {AssetId} with {Count} entries for tenant {TenantId}",
                assetId, schedules.Count, tenantId);

            return Ok(schedules);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to generate depreciation schedule for asset {AssetId}: {Message}", assetId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Run monthly depreciation for all active assets
    /// </summary>
    [HttpPost("run")]
    [RequirePermission("Asset.Depreciation.Run")]
    [ProducesResponseType(typeof(List<DepreciationScheduleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<DepreciationScheduleDto>>> RunMonthlyDepreciation(
        [FromRoute] Guid tenantId,
        [FromBody] RunDepreciationRequest request)
    {
        try
        {
            var schedules = await _depreciationService.RunMonthlyDepreciationAsync(request);
            _logger.LogInformation("Ran monthly depreciation for fiscal period {FiscalPeriodId} with {Count} entries for tenant {TenantId}",
                request.FiscalPeriodId, schedules.Count, tenantId);

            return Ok(schedules);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to run monthly depreciation: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post a single depreciation schedule to GL
    /// </summary>
    [HttpPost("schedules/{id:guid}/post")]
    [RequirePermission("Asset.Depreciation.Post")]
    [ProducesResponseType(typeof(DepreciationScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepreciationScheduleDto>> PostSchedule(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var schedule = await _depreciationService.PostDepreciationAsync(id);
            _logger.LogInformation("Posted depreciation schedule {Id} for tenant {TenantId}", id, tenantId);

            return Ok(schedule);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to post depreciation schedule {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post all depreciation schedules for a fiscal period
    /// </summary>
    [HttpPost("post-all/{fiscalPeriodId:guid}")]
    [RequirePermission("Asset.Depreciation.Post")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> PostAllDepreciation(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid fiscalPeriodId)
    {
        try
        {
            var postedCount = await _depreciationService.PostAllDepreciationAsync(fiscalPeriodId);
            _logger.LogInformation("Posted {Count} depreciation schedules for fiscal period {FiscalPeriodId} for tenant {TenantId}",
                postedCount, fiscalPeriodId, tenantId);

            return Ok(new { postedCount, message = $"Successfully posted {postedCount} depreciation schedules." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to post all depreciation: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reverse a posted depreciation schedule
    /// </summary>
    [HttpPost("schedules/{id:guid}/reverse")]
    [RequirePermission("Asset.Depreciation.Post")]
    [ProducesResponseType(typeof(DepreciationScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepreciationScheduleDto>> ReverseSchedule(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var schedule = await _depreciationService.ReverseDepreciationAsync(id);
            _logger.LogInformation("Reversed depreciation schedule {Id} for tenant {TenantId}", id, tenantId);

            return Ok(schedule);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to reverse depreciation schedule {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get depreciation summary for a fiscal period
    /// </summary>
    [HttpGet("summary/{fiscalPeriodId:guid}")]
    [RequirePermission("Asset.Report.View")]
    [ProducesResponseType(typeof(DepreciationSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DepreciationSummaryDto>> GetDepreciationSummary(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid fiscalPeriodId)
    {
        var summary = await _depreciationService.GetDepreciationSummaryAsync(fiscalPeriodId);
        return Ok(summary);
    }

    /// <summary>
    /// Get depreciation forecast for an asset
    /// </summary>
    [HttpGet("forecast/{assetId:guid}")]
    [RequirePermission("Asset.Depreciation.View")]
    [ProducesResponseType(typeof(List<DepreciationForecastDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DepreciationForecastDto>>> GetDepreciationForecast(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid assetId,
        [FromQuery] int months = 12)
    {
        var asset = await _assetService.GetAssetByIdAsync(assetId);
        if (asset == null)
        {
            return NotFound(new { message = "Asset not found." });
        }

        var forecast = await _depreciationService.GetDepreciationForecastAsync(assetId, Math.Min(months, 120));
        return Ok(forecast);
    }

    /// <summary>
    /// Calculate depreciation amount for an asset at a specific date
    /// </summary>
    [HttpGet("calculate/{assetId:guid}")]
    [RequirePermission("Asset.Depreciation.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> CalculateDepreciation(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid assetId,
        [FromQuery] DateTime? periodEndDate)
    {
        var asset = await _assetService.GetAssetByIdAsync(assetId);
        if (asset == null)
        {
            return NotFound(new { message = "Asset not found." });
        }

        var amount = await _depreciationService.CalculateDepreciationAmountAsync(assetId, periodEndDate ?? DateTime.Today);
        return Ok(new { depreciationAmount = amount, assetId, periodEndDate = periodEndDate ?? DateTime.Today });
    }
}
