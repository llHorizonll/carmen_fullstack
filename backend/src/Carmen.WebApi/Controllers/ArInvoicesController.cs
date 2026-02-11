using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AR;
using Carmen.Domain.Entities.AR;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// AR Invoice management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/ar/invoices")]
[Authorize]
public class ArInvoicesController : ControllerBase
{
    private readonly IArInvoiceService _invoiceService;
    private readonly ILogger<ArInvoicesController> _logger;

    public ArInvoicesController(
        IArInvoiceService invoiceService,
        ILogger<ArInvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of AR invoices
    /// </summary>
    [HttpGet]
    [RequirePermission("AR.Invoice.View")]
    [ProducesResponseType(typeof(PaginatedResult<ArInvoiceListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ArInvoiceListDto>>> GetInvoices(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] ArInvoiceStatus? status,
        [FromQuery] Guid? customerId,
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
        var query = new ArInvoiceQueryParams(
            Search: search,
            Status: status,
            CustomerId: customerId,
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
    /// Get AR invoice by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AR.Invoice.View")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> GetInvoice(
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
    /// Get AR invoice by number
    /// </summary>
    [HttpGet("by-number/{invoiceNumber}")]
    [RequirePermission("AR.Invoice.View")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> GetInvoiceByNumber(
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
    /// Get unpaid invoices for a customer (for receipt allocation)
    /// </summary>
    [HttpGet("unpaid")]
    [RequirePermission("AR.Invoice.View")]
    [ProducesResponseType(typeof(List<UnpaidArInvoiceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UnpaidArInvoiceDto>>> GetUnpaidInvoices(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid customerId)
    {
        var result = await _invoiceService.GetUnpaidInvoicesAsync(customerId);
        return Ok(result);
    }

    /// <summary>
    /// Create a new AR invoice
    /// </summary>
    [HttpPost]
    [RequirePermission("AR.Invoice.Create")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ArInvoiceDto>> CreateInvoice(
        [FromRoute] Guid tenantId,
        [FromBody] CreateArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.CreateInvoiceAsync(request);
            _logger.LogInformation("Created AR invoice {InvoiceNumber} for tenant {TenantId}",
                invoice.InvoiceNumber, tenantId);

            return CreatedAtAction(
                nameof(GetInvoice),
                new { tenantId, id = invoice.Id },
                invoice);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create AR invoice: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing AR invoice
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AR.Invoice.Edit")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> UpdateInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.UpdateInvoiceAsync(id, request);
            _logger.LogInformation("Updated AR invoice {InvoiceNumber} for tenant {TenantId}",
                invoice.InvoiceNumber, tenantId);

            return Ok(invoice);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update AR invoice {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an AR invoice
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AR.Invoice.Delete")]
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
            _logger.LogInformation("Deleted AR invoice {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Invoice not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete AR invoice {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Submit AR invoice for approval
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [RequirePermission("AR.Invoice.Edit")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> SubmitForApproval(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] SubmitArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.SubmitForApprovalAsync(id, request);
            _logger.LogInformation("Submitted AR invoice {InvoiceNumber} for approval",
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
    /// Approve an AR invoice
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("AR.Invoice.Approve")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> ApproveInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] ApproveArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.ApproveInvoiceAsync(id, request);
            _logger.LogInformation("Approved AR invoice {InvoiceNumber}", invoice.InvoiceNumber);

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
    /// Reject an AR invoice
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    [RequirePermission("AR.Invoice.Approve")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> RejectInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] RejectArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.RejectInvoiceAsync(id, request);
            _logger.LogInformation("Rejected AR invoice {InvoiceNumber}", invoice.InvoiceNumber);

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
    /// Void an AR invoice
    /// </summary>
    [HttpPost("{id:guid}/void")]
    [RequirePermission("AR.Invoice.Void")]
    [ProducesResponseType(typeof(ArInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ArInvoiceDto>> VoidInvoice(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] VoidArInvoiceRequest request)
    {
        try
        {
            var invoice = await _invoiceService.VoidInvoiceAsync(id, request);
            _logger.LogInformation("Voided AR invoice {InvoiceNumber}", invoice.InvoiceNumber);

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
    [RequirePermission("AR.Invoice.View")]
    [ProducesResponseType(typeof(TaxCalculationResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<TaxCalculationResult>> CalculateTaxes(
        [FromRoute] Guid tenantId,
        [FromBody] CalculateTaxRequest request)
    {
        var result = await _invoiceService.CalculateTaxesAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Generate next invoice number
    /// </summary>
    [HttpGet("next-number")]
    [RequirePermission("AR.Invoice.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetNextInvoiceNumber(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? date = null)
    {
        var invoiceNumber = await _invoiceService.GenerateInvoiceNumberAsync(date ?? DateTime.UtcNow);
        return Ok(new { invoiceNumber });
    }
}
