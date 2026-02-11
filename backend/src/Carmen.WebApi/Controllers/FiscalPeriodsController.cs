using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Fiscal year and period management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/fiscal-periods")]
[Authorize]
public class FiscalPeriodsController : ControllerBase
{
    private readonly IFiscalPeriodService _fiscalPeriodService;
    private readonly ILogger<FiscalPeriodsController> _logger;

    public FiscalPeriodsController(
        IFiscalPeriodService fiscalPeriodService,
        ILogger<FiscalPeriodsController> logger)
    {
        _fiscalPeriodService = fiscalPeriodService;
        _logger = logger;
    }

    // Fiscal Year endpoints

    /// <summary>
    /// Get all fiscal years
    /// </summary>
    [HttpGet("years")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(List<FiscalYearListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FiscalYearListDto>>> GetFiscalYears(
        [FromRoute] Guid tenantId)
    {
        var years = await _fiscalPeriodService.GetFiscalYearsAsync();
        return Ok(years);
    }

    /// <summary>
    /// Get fiscal year by ID
    /// </summary>
    [HttpGet("years/{id:guid}")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(FiscalYearDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalYearDto>> GetFiscalYear(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var year = await _fiscalPeriodService.GetFiscalYearByIdAsync(id);

        if (year == null)
        {
            return NotFound(new { message = "Fiscal year not found." });
        }

        return Ok(year);
    }

    /// <summary>
    /// Create a new fiscal year
    /// </summary>
    [HttpPost("years")]
    [RequirePermission("GL.FiscalPeriod.Create")]
    [ProducesResponseType(typeof(FiscalYearDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FiscalYearDto>> CreateFiscalYear(
        [FromRoute] Guid tenantId,
        [FromBody] CreateFiscalYearRequest request)
    {
        try
        {
            var year = await _fiscalPeriodService.CreateFiscalYearAsync(request);
            _logger.LogInformation("Created fiscal year {Name} for tenant {TenantId}",
                year.Name, tenantId);

            return CreatedAtAction(
                nameof(GetFiscalYear),
                new { tenantId, id = year.Id },
                year);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create fiscal year: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    // Fiscal Period endpoints

    /// <summary>
    /// Get paginated list of fiscal periods
    /// </summary>
    [HttpGet]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(PaginatedResult<FiscalPeriodListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<FiscalPeriodListDto>>> GetPeriods(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid? fiscalYearId,
        [FromQuery] PeriodStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new FiscalPeriodQueryParams(
            FiscalYearId: fiscalYearId,
            Status: status,
            Page: page,
            PageSize: Math.Min(pageSize, 100)
        );

        var result = await _fiscalPeriodService.GetPeriodsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get fiscal period by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> GetPeriod(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var period = await _fiscalPeriodService.GetPeriodByIdAsync(id);

        if (period == null)
        {
            return NotFound(new { message = "Period not found." });
        }

        return Ok(period);
    }

    /// <summary>
    /// Get periods for lookup (dropdown)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(List<FiscalPeriodLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FiscalPeriodLookupDto>>> GetPeriodLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid? fiscalYearId,
        [FromQuery] bool openOnly = false)
    {
        var periods = await _fiscalPeriodService.GetPeriodLookupAsync(fiscalYearId, openOnly);
        return Ok(periods);
    }

    /// <summary>
    /// Get current open period
    /// </summary>
    [HttpGet("current")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> GetCurrentPeriod(
        [FromRoute] Guid tenantId)
    {
        var period = await _fiscalPeriodService.GetCurrentPeriodAsync();

        if (period == null)
        {
            return NotFound(new { message = "No current open period found." });
        }

        return Ok(period);
    }

    /// <summary>
    /// Find period by date
    /// </summary>
    [HttpGet("by-date")]
    [RequirePermission("GL.FiscalPeriod.View")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> GetPeriodByDate(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime date)
    {
        var period = await _fiscalPeriodService.GetPeriodByDateAsync(date);

        if (period == null)
        {
            return NotFound(new { message = "No period found for the specified date." });
        }

        return Ok(period);
    }

    // Period Closing endpoints

    /// <summary>
    /// Validate if a period can be closed
    /// </summary>
    [HttpGet("{id:guid}/close-validation")]
    [RequirePermission("GL.Period.Close")]
    [ProducesResponseType(typeof(PeriodCloseValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PeriodCloseValidationResult>> ValidatePeriodClose(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var validation = await _fiscalPeriodService.ValidatePeriodCloseAsync(id);
            return Ok(validation);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Period not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get vouchers blocking period close
    /// </summary>
    [HttpGet("{id:guid}/blocking-vouchers")]
    [RequirePermission("GL.Period.Close")]
    [ProducesResponseType(typeof(PeriodBlockingVouchersDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PeriodBlockingVouchersDto>> GetBlockingVouchers(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var vouchers = await _fiscalPeriodService.GetBlockingVouchersAsync(id);
            return Ok(vouchers);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Close a fiscal period
    /// </summary>
    [HttpPost("{id:guid}/close")]
    [RequirePermission("GL.Period.Close")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> ClosePeriod(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ClosePeriodRequest request)
    {
        try
        {
            var period = await _fiscalPeriodService.ClosePeriodAsync(id, request);
            _logger.LogInformation("Closed fiscal period {PeriodName} for tenant {TenantId}",
                period.Name, tenantId);

            return Ok(period);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Period not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to close period {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reopen a closed fiscal period
    /// </summary>
    [HttpPost("{id:guid}/reopen")]
    [RequirePermission("GL.Period.Reopen")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> ReopenPeriod(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ReopenPeriodRequest request)
    {
        try
        {
            var period = await _fiscalPeriodService.ReopenPeriodAsync(id, request);
            _logger.LogInformation("Reopened fiscal period {PeriodName} for tenant {TenantId}",
                period.Name, tenantId);

            return Ok(period);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Period not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to reopen period {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lock a fiscal period permanently
    /// </summary>
    [HttpPost("{id:guid}/lock")]
    [RequirePermission("GL.Period.Lock")]
    [ProducesResponseType(typeof(FiscalPeriodDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FiscalPeriodDto>> LockPeriod(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var period = await _fiscalPeriodService.LockPeriodAsync(id);
            _logger.LogInformation("Locked fiscal period {PeriodName} for tenant {TenantId}",
                period.Name, tenantId);

            return Ok(period);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Period not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to lock period {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }
}
