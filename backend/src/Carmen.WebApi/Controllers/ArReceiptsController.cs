using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AR;
using Carmen.Domain.Entities.AR;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// AR Receipt management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/ar/receipts")]
[Authorize]
public class ArReceiptsController : ControllerBase
{
    private readonly IArReceiptService _receiptService;
    private readonly ILogger<ArReceiptsController> _logger;

    public ArReceiptsController(
        IArReceiptService receiptService,
        ILogger<ArReceiptsController> logger)
    {
        _receiptService = receiptService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of AR receipts
    /// </summary>
    [HttpGet]
    [RequirePermission("AR.Receipt.View")]
    [ProducesResponseType(typeof(PaginatedResult<ArReceiptListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ArReceiptListDto>>> GetReceipts(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] ArReceiptStatus? status,
        [FromQuery] Guid? customerId,
        [FromQuery] ReceiptMethod? receiptMethod,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] Guid? fiscalPeriodId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "ReceiptDate",
        [FromQuery] bool sortDescending = true)
    {
        var query = new ArReceiptQueryParams(
            Search: search,
            Status: status,
            CustomerId: customerId,
            ReceiptMethod: receiptMethod,
            DateFrom: dateFrom,
            DateTo: dateTo,
            FiscalPeriodId: fiscalPeriodId,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _receiptService.GetReceiptsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get AR receipt by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AR.Receipt.View")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> GetReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var receipt = await _receiptService.GetReceiptByIdAsync(id);

        if (receipt == null)
        {
            return NotFound(new { message = "Receipt not found." });
        }

        return Ok(receipt);
    }

    /// <summary>
    /// Get AR receipt by number
    /// </summary>
    [HttpGet("by-number/{receiptNumber}")]
    [RequirePermission("AR.Receipt.View")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> GetReceiptByNumber(
        [FromRoute] Guid tenantId,
        [FromRoute] string receiptNumber)
    {
        var receipt = await _receiptService.GetReceiptByNumberAsync(receiptNumber);

        if (receipt == null)
        {
            return NotFound(new { message = "Receipt not found." });
        }

        return Ok(receipt);
    }

    /// <summary>
    /// Create a new AR receipt
    /// </summary>
    [HttpPost]
    [RequirePermission("AR.Receipt.Create")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ArReceiptDto>> CreateReceipt(
        [FromRoute] Guid tenantId,
        [FromBody] CreateArReceiptRequest request)
    {
        try
        {
            var receipt = await _receiptService.CreateReceiptAsync(request);
            _logger.LogInformation("Created AR receipt {ReceiptNumber} for tenant {TenantId}",
                receipt.ReceiptNumber, tenantId);

            return CreatedAtAction(
                nameof(GetReceipt),
                new { tenantId, id = receipt.Id },
                receipt);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create AR receipt: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing AR receipt
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AR.Receipt.Edit")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> UpdateReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateArReceiptRequest request)
    {
        try
        {
            var receipt = await _receiptService.UpdateReceiptAsync(id, request);
            _logger.LogInformation("Updated AR receipt {ReceiptNumber} for tenant {TenantId}",
                receipt.ReceiptNumber, tenantId);

            return Ok(receipt);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Receipt not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update AR receipt {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an AR receipt
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AR.Receipt.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _receiptService.DeleteReceiptAsync(id);
            _logger.LogInformation("Deleted AR receipt {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Receipt not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete AR receipt {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve an AR receipt
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("AR.Receipt.Approve")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> ApproveReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ApproveArReceiptRequest request)
    {
        try
        {
            var receipt = await _receiptService.ApproveReceiptAsync(id, request);
            _logger.LogInformation("Approved AR receipt {ReceiptNumber}", receipt.ReceiptNumber);

            return Ok(receipt);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Receipt not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post an AR receipt (creates GL journal voucher and updates invoice balances)
    /// </summary>
    [HttpPost("{id:guid}/post")]
    [RequirePermission("AR.Receipt.Post")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> PostReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] PostArReceiptRequest request)
    {
        try
        {
            var receipt = await _receiptService.PostReceiptAsync(id, request);
            _logger.LogInformation("Posted AR receipt {ReceiptNumber}", receipt.ReceiptNumber);

            return Ok(receipt);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Receipt not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Void an AR receipt (reverses GL journal voucher and restores invoice balances)
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [RequirePermission("AR.Receipt.Post")]
    [ProducesResponseType(typeof(ArReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArReceiptDto>> VoidReceipt(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] VoidArReceiptRequest request)
    {
        try
        {
            var receipt = await _receiptService.VoidReceiptAsync(id, request);
            _logger.LogInformation("Voided AR receipt {ReceiptNumber}", receipt.ReceiptNumber);

            return Ok(receipt);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Receipt not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Auto-allocate receipt amount to invoices using FIFO
    /// </summary>
    [HttpPost("auto-allocate")]
    [RequirePermission("AR.Receipt.Create")]
    [ProducesResponseType(typeof(ArAutoAllocateResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ArAutoAllocateResult>> AutoAllocate(
        [FromRoute] Guid tenantId,
        [FromBody] ArAutoAllocateRequest request)
    {
        var result = await _receiptService.AutoAllocateAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Calculate exchange gain/loss for allocation
    /// </summary>
    [HttpGet("calculate-exchange-gain-loss")]
    [RequirePermission("AR.Receipt.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CalculateExchangeGainLoss(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid invoiceId,
        [FromQuery] decimal allocationAmount,
        [FromQuery] decimal receiptExchangeRate)
    {
        var exchangeGainLoss = await _receiptService.CalculateExchangeGainLossAsync(
            invoiceId, allocationAmount, receiptExchangeRate);

        return Ok(new
        {
            exchangeGainLoss,
            isGain = exchangeGainLoss > 0,
            isLoss = exchangeGainLoss < 0
        });
    }

    /// <summary>
    /// Generate next receipt number
    /// </summary>
    [HttpGet("next-number")]
    [RequirePermission("AR.Receipt.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextReceiptNumber(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? date = null)
    {
        var receiptNumber = await _receiptService.GenerateReceiptNumberAsync(date ?? DateTime.UtcNow);
        return Ok(new { receiptNumber });
    }
}
