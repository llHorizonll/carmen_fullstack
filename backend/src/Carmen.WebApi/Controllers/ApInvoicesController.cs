using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AP;
using Carmen.Domain.Entities.AP;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// AP Invoice management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/ap/invoices")]
[Authorize]
public class ApInvoicesController : ControllerBase
{
    private readonly IApInvoiceService _invoiceService;
    private readonly ILogger<ApInvoicesController> _logger;

    public ApInvoicesController(
        IApInvoiceService invoiceService,
        ILogger<ApInvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of AP invoices
    /// </summary>
    [HttpGet]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(PaginatedResult<ApInvoiceListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ApInvoiceListDto>>> GetInvoices(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] ApInvoiceStatus? status,
        [FromQuery] Guid? vendorId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] DateTime? dueDateFrom,
        [FromQuery] DateTime? dueDateTo,
        [FromQuery] bool? hasBalance,
        [FromQuery] Guid? fiscalPeriodId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "InvoiceDate",
        [FromQuery] bool sortDescending = true)
    {
        var query = new ApInvoiceQueryParams(
            Search: search,
            Status: status,
            VendorId: vendorId,
            DateFrom: dateFrom,
            DateTo: dateTo,
            DueDateFrom: dueDateFrom,
            DueDateTo: dueDateTo,
            HasBalance: hasBalance,
            FiscalPeriodId: fiscalPeriodId,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _invoiceService.GetInvoicesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get AP invoice by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> GetInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);

        if (invoice == null)
        {
            return NotFound(new { message = "Invoice not found." });
        }

        return Ok(invoice);
    }

    /// <summary>
    /// Get AP invoice by number
    /// </summary>
    [HttpGet("by-number/{invoiceNumber}")]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> GetInvoiceByNumber(
        [FromRoute] Guid tenantId,
        [FromRoute] string invoiceNumber)
    {
        var invoice = await _invoiceService.GetInvoiceByNumberAsync(invoiceNumber);

        if (invoice == null)
        {
            return NotFound(new { message = "Invoice not found." });
        }

        return Ok(invoice);
    }

    /// <summary>
    /// Get unpaid invoices for a vendor (for payment allocation)
    /// </summary>
    [HttpGet("unpaid")]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(List<UnpaidInvoiceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UnpaidInvoiceDto>>> GetUnpaidInvoices(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid vendorId)
    {
        var result = await _invoiceService.GetUnpaidInvoicesAsync(vendorId);
        return Ok(result);
    }

    /// <summary>
    /// Create a new AP invoice
    /// </summary>
    [HttpPost]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApInvoiceDto>> CreateInvoice(
        [FromRoute] Guid tenantId,
        [FromBody] CreateApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.CreateInvoiceAsync(request);
            _logger.LogInformation("Created AP invoice {InvoiceNumber} for tenant {TenantId}",
                invoice.InvoiceNumber, tenantId);

            return CreatedAtAction(
                nameof(GetInvoice),
                new { tenantId, id = invoice.Id },
                invoice);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create AP invoice: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing AP invoice
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AP.Invoice.Edit")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> UpdateInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.UpdateInvoiceAsync(id, request);
            _logger.LogInformation("Updated AP invoice {InvoiceNumber} for tenant {TenantId}",
                invoice.InvoiceNumber, tenantId);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update AP invoice {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an AP invoice
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AP.Invoice.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _invoiceService.DeleteInvoiceAsync(id);
            _logger.LogInformation("Deleted AP invoice {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete AP invoice {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Submit AP invoice for approval
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [RequirePermission("AP.Invoice.Edit")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> SubmitForApproval(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] SubmitApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.SubmitForApprovalAsync(id, request);
            _logger.LogInformation("Submitted AP invoice {InvoiceNumber} for approval",
                invoice.InvoiceNumber);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Approve an AP invoice
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("AP.Invoice.Approve")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> ApproveInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ApproveApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.ApproveInvoiceAsync(id, request);
            _logger.LogInformation("Approved AP invoice {InvoiceNumber}", invoice.InvoiceNumber);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject an AP invoice
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    [RequirePermission("AP.Invoice.Approve")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> RejectInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] RejectApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.RejectInvoiceAsync(id, request);
            _logger.LogInformation("Rejected AP invoice {InvoiceNumber}", invoice.InvoiceNumber);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Void an AP invoice
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [RequirePermission("AP.Invoice.Void")]
    [ProducesResponseType(typeof(ApInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApInvoiceDto>> VoidInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] VoidApInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.VoidInvoiceAsync(id, request);
            _logger.LogInformation("Voided AP invoice {InvoiceNumber}", invoice.InvoiceNumber);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Calculate taxes for an invoice
    /// </summary>
    [HttpPost("calculate-tax")]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(TaxCalculationResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<TaxCalculationResult>> CalculateTaxes(
        [FromRoute] Guid tenantId,
        [FromBody] CalculateTaxRequest request)
    {
        var result = await _invoiceService.CalculateTaxesAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Validate AP invoice data
    /// </summary>
    [HttpPost("validate")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ValidateInvoice(
        [FromRoute] Guid tenantId,
        [FromBody] CreateApInvoiceRequest request)
    {
        var errors = await _invoiceService.ValidateInvoiceAsync(request);
        return Ok(new { valid = errors.Count == 0, errors });
    }

    /// <summary>
    /// Check vendor credit limit
    /// </summary>
    [HttpGet("check-credit-limit")]
    [RequirePermission("AP.Invoice.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckCreditLimit(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid vendorId,
        [FromQuery] decimal invoiceAmount)
    {
        try
        {
            var result = await _invoiceService.CheckCreditLimitAsync(vendorId, invoiceAmount);
            return Ok(new
            {
                isExceeded = result.IsExceeded,
                creditLimit = result.CreditLimit,
                currentBalance = result.CurrentBalance,
                invoiceAmount = result.InvoiceAmount,
                newBalance = result.CurrentBalance + result.InvoiceAmount
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Generate next invoice number
    /// </summary>
    [HttpGet("next-number")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextInvoiceNumber(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? date = null)
    {
        var invoiceNumber = await _invoiceService.GenerateInvoiceNumberAsync(date ?? DateTime.UtcNow);
        return Ok(new { invoiceNumber });
    }
}
