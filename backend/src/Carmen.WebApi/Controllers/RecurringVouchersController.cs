using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Recurring voucher template management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/gl/recurring-vouchers")]
[Authorize]
public class RecurringVouchersController : ControllerBase
{
    private readonly IRecurringVoucherService _service;
    private readonly ILogger<RecurringVouchersController> _logger;

    public RecurringVouchersController(
        IRecurringVoucherService service,
        ILogger<RecurringVouchersController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of recurring vouchers
    /// </summary>
    [HttpGet]
    [RequirePermission("GL.JournalVoucher.View")]
    [ProducesResponseType(typeof(PaginatedResult<RecurringVoucherListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<RecurringVoucherListDto>>> GetRecurringVouchers(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] RecurringFrequency? frequency,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "Name",
        [FromQuery] bool sortDescending = false)
    {
        var query = new RecurringVoucherQueryParams(
            Search: search,
            IsActive: isActive,
            Frequency: frequency,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _service.GetRecurringVouchersAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get recurring voucher by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.View")]
    [ProducesResponseType(typeof(RecurringVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecurringVoucherDto>> GetRecurringVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var result = await _service.GetRecurringVoucherByIdAsync(id);
        if (result == null)
            return NotFound(new { message = "Recurring voucher not found." });

        return Ok(result);
    }

    /// <summary>
    /// Create a new recurring voucher template
    /// </summary>
    [HttpPost]
    [RequirePermission("GL.JournalVoucher.Create")]
    [ProducesResponseType(typeof(RecurringVoucherDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecurringVoucherDto>> CreateRecurringVoucher(
        [FromRoute] Guid tenantId,
        [FromBody] CreateRecurringVoucherRequest request)
    {
        try
        {
            var result = await _service.CreateRecurringVoucherAsync(request);
            _logger.LogInformation("Created recurring voucher {Name} for tenant {TenantId}",
                result.Name, tenantId);

            return CreatedAtAction(
                nameof(GetRecurringVoucher),
                new { tenantId, id = result.Id },
                result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create recurring voucher: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing recurring voucher template
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.Edit")]
    [ProducesResponseType(typeof(RecurringVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecurringVoucherDto>> UpdateRecurringVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateRecurringVoucherRequest request)
    {
        try
        {
            var result = await _service.UpdateRecurringVoucherAsync(id, request);
            _logger.LogInformation("Updated recurring voucher {Name} for tenant {TenantId}",
                result.Name, tenantId);

            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Recurring voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update recurring voucher {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a recurring voucher template
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteRecurringVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _service.DeleteRecurringVoucherAsync(id);
            _logger.LogInformation("Deleted recurring voucher {Id} for tenant {TenantId}", id, tenantId);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Recurring voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Activate a recurring voucher
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [RequirePermission("GL.JournalVoucher.Edit")]
    [ProducesResponseType(typeof(RecurringVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecurringVoucherDto>> Activate(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var result = await _service.ActivateAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Deactivate a recurring voucher
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [RequirePermission("GL.JournalVoucher.Edit")]
    [ProducesResponseType(typeof(RecurringVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecurringVoucherDto>> Deactivate(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var result = await _service.DeactivateAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
