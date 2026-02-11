using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Journal Voucher management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/journal-vouchers")]
[Authorize]
public class JournalVouchersController : ControllerBase
{
    private readonly IJournalVoucherService _voucherService;
    private readonly ILogger<JournalVouchersController> _logger;

    public JournalVouchersController(
        IJournalVoucherService voucherService,
        ILogger<JournalVouchersController> logger)
    {
        _voucherService = voucherService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of journal vouchers
    /// </summary>
    [HttpGet]
    [RequirePermission("GL.JournalVoucher.View")]
    [ProducesResponseType(typeof(PaginatedResult<JournalVoucherListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<JournalVoucherListDto>>> GetVouchers(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] DocumentStatus? status,
        [FromQuery] VoucherType? voucherType,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] Guid? fiscalPeriodId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "VoucherDate",
        [FromQuery] bool sortDescending = true)
    {
        var query = new JournalVoucherQueryParams(
            Search: search,
            Status: status,
            VoucherType: voucherType,
            DateFrom: dateFrom,
            DateTo: dateTo,
            FiscalPeriodId: fiscalPeriodId,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _voucherService.GetVouchersAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get journal voucher by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.View")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> GetVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var voucher = await _voucherService.GetVoucherByIdAsync(id);

        if (voucher == null)
        {
            return NotFound(new { message = "Journal voucher not found." });
        }

        return Ok(voucher);
    }

    /// <summary>
    /// Get journal voucher by number
    /// </summary>
    [HttpGet("by-number/{voucherNumber}")]
    [RequirePermission("GL.JournalVoucher.View")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> GetVoucherByNumber(
        [FromRoute] Guid tenantId,
        [FromRoute] string voucherNumber)
    {
        var voucher = await _voucherService.GetVoucherByNumberAsync(voucherNumber);

        if (voucher == null)
        {
            return NotFound(new { message = "Journal voucher not found." });
        }

        return Ok(voucher);
    }

    /// <summary>
    /// Create a new journal voucher
    /// </summary>
    [HttpPost]
    [RequirePermission("GL.JournalVoucher.Create")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<JournalVoucherDto>> CreateVoucher(
        [FromRoute] Guid tenantId,
        [FromBody] CreateJournalVoucherRequest request)
    {
        try
        {
            var voucher = await _voucherService.CreateVoucherAsync(request);
            _logger.LogInformation("Created journal voucher {VoucherNumber} for tenant {TenantId}",
                voucher.VoucherNumber, tenantId);

            return CreatedAtAction(
                nameof(GetVoucher),
                new { tenantId, id = voucher.Id },
                voucher);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create journal voucher: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing journal voucher
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.Edit")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> UpdateVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateJournalVoucherRequest request)
    {
        try
        {
            var voucher = await _voucherService.UpdateVoucherAsync(id, request);
            _logger.LogInformation("Updated journal voucher {VoucherNumber} for tenant {TenantId}",
                voucher.VoucherNumber, tenantId);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update journal voucher {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a journal voucher
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("GL.JournalVoucher.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _voucherService.DeleteVoucherAsync(id);
            _logger.LogInformation("Deleted journal voucher {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete journal voucher {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Submit journal voucher for approval
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [RequirePermission("GL.JournalVoucher.Edit")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> SubmitForApproval(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] SubmitForApprovalRequest request)
    {
        try
        {
            var voucher = await _voucherService.SubmitForApprovalAsync(id, request);
            _logger.LogInformation("Submitted journal voucher {VoucherNumber} for approval",
                voucher.VoucherNumber);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve a journal voucher
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("GL.JournalVoucher.Approve")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> ApproveVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ApproveVoucherRequest request)
    {
        try
        {
            var voucher = await _voucherService.ApproveVoucherAsync(id, request);
            _logger.LogInformation("Approved journal voucher {VoucherNumber}", voucher.VoucherNumber);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject a journal voucher
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    [RequirePermission("GL.JournalVoucher.Approve")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> RejectVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] RejectVoucherRequest request)
    {
        try
        {
            var voucher = await _voucherService.RejectVoucherAsync(id, request);
            _logger.LogInformation("Rejected journal voucher {VoucherNumber}", voucher.VoucherNumber);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post a journal voucher
    /// </summary>
    [HttpPost("{id:guid}/post")]
    [RequirePermission("GL.JournalVoucher.Post")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> PostVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] PostVoucherRequest request)
    {
        try
        {
            var voucher = await _voucherService.PostVoucherAsync(id, request);
            _logger.LogInformation("Posted journal voucher {VoucherNumber}", voucher.VoucherNumber);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reverse a posted journal voucher
    /// </summary>
    [HttpPost("{id:guid}/reverse")]
    [RequirePermission("GL.JournalVoucher.Post")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> ReverseVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ReverseVoucherRequest request)
    {
        try
        {
            var reversalVoucher = await _voucherService.ReverseVoucherAsync(id, request);
            _logger.LogInformation("Reversed journal voucher with new voucher {VoucherNumber}",
                reversalVoucher.VoucherNumber);

            return CreatedAtAction(
                nameof(GetVoucher),
                new { tenantId, id = reversalVoucher.Id },
                reversalVoucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Void a journal voucher
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [RequirePermission("GL.JournalVoucher.Post")]
    [ProducesResponseType(typeof(JournalVoucherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JournalVoucherDto>> VoidVoucher(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] string reason)
    {
        try
        {
            var voucher = await _voucherService.VoidVoucherAsync(id, reason);
            _logger.LogInformation("Voided journal voucher {VoucherNumber}", voucher.VoucherNumber);

            return Ok(voucher);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Journal voucher not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Validate journal voucher data
    /// </summary>
    [HttpPost("validate")]
    [RequirePermission("GL.JournalVoucher.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ValidateVoucher(
        [FromRoute] Guid tenantId,
        [FromBody] CreateJournalVoucherRequest request)
    {
        var errors = await _voucherService.ValidateVoucherAsync(request);
        return Ok(new { valid = errors.Count == 0, errors });
    }

    /// <summary>
    /// Generate next voucher number
    /// </summary>
    [HttpGet("next-number")]
    [RequirePermission("GL.JournalVoucher.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextVoucherNumber(
        [FromRoute] Guid tenantId,
        [FromQuery] VoucherType voucherType = VoucherType.General,
        [FromQuery] DateTime? date = null)
    {
        var voucherNumber = await _voucherService.GenerateVoucherNumberAsync(
            voucherType,
            date ?? DateTime.UtcNow);

        return Ok(new { voucherNumber });
    }
}
