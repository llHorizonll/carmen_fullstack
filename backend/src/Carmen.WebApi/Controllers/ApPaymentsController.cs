using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AP;
using Carmen.Domain.Entities.AP;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// AP Payment management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/ap/payments")]
[Authorize]
public class ApPaymentsController : ControllerBase
{
    private readonly IApPaymentService _paymentService;
    private readonly ILogger<ApPaymentsController> _logger;

    public ApPaymentsController(
        IApPaymentService paymentService,
        ILogger<ApPaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of AP payments
    /// </summary>
    [HttpGet]
    [RequirePermission("AP.Payment.View")]
    [ProducesResponseType(typeof(PaginatedResult<ApPaymentListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ApPaymentListDto>>> GetPayments(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] ApPaymentStatus? status,
        [FromQuery] Guid? vendorId,
        [FromQuery] PaymentMethod? paymentMethod,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] Guid? fiscalPeriodId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "PaymentDate",
        [FromQuery] bool sortDescending = true)
    {
        var query = new ApPaymentQueryParams(
            Search: search,
            Status: status,
            VendorId: vendorId,
            PaymentMethod: paymentMethod,
            DateFrom: dateFrom,
            DateTo: dateTo,
            FiscalPeriodId: fiscalPeriodId,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _paymentService.GetPaymentsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get AP payment by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AP.Payment.View")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> GetPayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(id);

        if (payment == null)
        {
            return NotFound(new { message = "Payment not found." });
        }

        return Ok(payment);
    }

    /// <summary>
    /// Get AP payment by number
    /// </summary>
    [HttpGet("by-number/{paymentNumber}")]
    [RequirePermission("AP.Payment.View")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> GetPaymentByNumber(
        [FromRoute] Guid tenantId,
        [FromRoute] string paymentNumber)
    {
        var payment = await _paymentService.GetPaymentByNumberAsync(paymentNumber);

        if (payment == null)
        {
            return NotFound(new { message = "Payment not found." });
        }

        return Ok(payment);
    }

    /// <summary>
    /// Create a new AP payment
    /// </summary>
    [HttpPost]
    [RequirePermission("AP.Payment.Create")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApPaymentDto>> CreatePayment(
        [FromRoute] Guid tenantId,
        [FromBody] CreateApPaymentRequest request)
    {
        try
        {
            var payment = await _paymentService.CreatePaymentAsync(request);
            _logger.LogInformation("Created AP payment {PaymentNumber} for tenant {TenantId}",
                payment.PaymentNumber, tenantId);

            return CreatedAtAction(
                nameof(GetPayment),
                new { tenantId, id = payment.Id },
                payment);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create AP payment: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing AP payment
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AP.Payment.Edit")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> UpdatePayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateApPaymentRequest request)
    {
        try
        {
            var payment = await _paymentService.UpdatePaymentAsync(id, request);
            _logger.LogInformation("Updated AP payment {PaymentNumber} for tenant {TenantId}",
                payment.PaymentNumber, tenantId);

            return Ok(payment);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update AP payment {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an AP payment
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AP.Payment.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeletePayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _paymentService.DeletePaymentAsync(id);
            _logger.LogInformation("Deleted AP payment {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete AP payment {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve an AP payment
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("AP.Payment.Approve")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> ApprovePayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ApproveApPaymentRequest request)
    {
        try
        {
            var payment = await _paymentService.ApprovePaymentAsync(id, request);
            _logger.LogInformation("Approved AP payment {PaymentNumber}", payment.PaymentNumber);

            return Ok(payment);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post an AP payment (creates GL journal voucher and updates invoice balances)
    /// </summary>
    [HttpPost("{id:guid}/post")]
    [RequirePermission("AP.Payment.Post")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> PostPayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] PostApPaymentRequest request)
    {
        try
        {
            var payment = await _paymentService.PostPaymentAsync(id, request);
            _logger.LogInformation("Posted AP payment {PaymentNumber}", payment.PaymentNumber);

            return Ok(payment);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Void an AP payment (reverses GL journal voucher and restores invoice balances)
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [RequirePermission("AP.Payment.Post")]
    [ProducesResponseType(typeof(ApPaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApPaymentDto>> VoidPayment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] VoidApPaymentRequest request)
    {
        try
        {
            var payment = await _paymentService.VoidPaymentAsync(id, request);
            _logger.LogInformation("Voided AP payment {PaymentNumber}", payment.PaymentNumber);

            return Ok(payment);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Auto-allocate payment amount to invoices using FIFO
    /// </summary>
    [HttpPost("auto-allocate")]
    [RequirePermission("AP.Payment.Create")]
    [ProducesResponseType(typeof(AutoAllocateResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<AutoAllocateResult>> AutoAllocate(
        [FromRoute] Guid tenantId,
        [FromBody] AutoAllocateRequest request)
    {
        var result = await _paymentService.AutoAllocateAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Validate AP payment data
    /// </summary>
    [HttpPost("validate")]
    [RequirePermission("AP.Payment.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ValidatePayment(
        [FromRoute] Guid tenantId,
        [FromBody] CreateApPaymentRequest request)
    {
        var errors = await _paymentService.ValidatePaymentAsync(request);
        return Ok(new { valid = errors.Count == 0, errors });
    }

    /// <summary>
    /// Calculate exchange gain/loss for allocation
    /// </summary>
    [HttpGet("calculate-exchange-gain-loss")]
    [RequirePermission("AP.Payment.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CalculateExchangeGainLoss(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid invoiceId,
        [FromQuery] decimal allocationAmount,
        [FromQuery] decimal paymentExchangeRate)
    {
        var exchangeGainLoss = await _paymentService.CalculateExchangeGainLossAsync(
            invoiceId, allocationAmount, paymentExchangeRate);

        return Ok(new
        {
            exchangeGainLoss,
            isGain = exchangeGainLoss > 0,
            isLoss = exchangeGainLoss < 0
        });
    }

    /// <summary>
    /// Generate next payment number
    /// </summary>
    [HttpGet("next-number")]
    [RequirePermission("AP.Payment.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextPaymentNumber(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? date = null)
    {
        var paymentNumber = await _paymentService.GeneratePaymentNumberAsync(date ?? DateTime.UtcNow);
        return Ok(new { paymentNumber });
    }
}
