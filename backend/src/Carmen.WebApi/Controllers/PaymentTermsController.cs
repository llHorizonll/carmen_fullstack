using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Services.Configuration;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Payment Term management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/payment-terms")]
[Authorize]
public class PaymentTermsController : ControllerBase
{
    private readonly IPaymentTermService _paymentTermService;
    private readonly ILogger<PaymentTermsController> _logger;

    public PaymentTermsController(
        IPaymentTermService paymentTermService,
        ILogger<PaymentTermsController> logger)
    {
        _paymentTermService = paymentTermService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of payment terms
    /// </summary>
    [HttpGet]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(PaginatedResult<PaymentTermListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<PaymentTermListDto>>> GetPaymentTerms(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "TermCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new PaymentTermQueryParams(
            Search: search,
            IsActive: isActive,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _paymentTermService.GetPaymentTermsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get payment term by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(PaymentTermDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentTermDto>> GetPaymentTerm(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var paymentTerm = await _paymentTermService.GetPaymentTermByIdAsync(id);

        if (paymentTerm == null)
        {
            return NotFound(new { message = "Payment term not found." });
        }

        return Ok(paymentTerm);
    }

    /// <summary>
    /// Get payment term by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(PaymentTermDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentTermDto>> GetPaymentTermByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code)
    {
        var paymentTerm = await _paymentTermService.GetPaymentTermByCodeAsync(code);

        if (paymentTerm == null)
        {
            return NotFound(new { message = "Payment term not found." });
        }

        return Ok(paymentTerm);
    }

    /// <summary>
    /// Get payment terms for lookup (dropdown/select)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(List<PaymentTermLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PaymentTermLookupDto>>> GetPaymentTermLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] bool? isActive)
    {
        var paymentTerms = await _paymentTermService.GetPaymentTermLookupAsync(isActive);
        return Ok(paymentTerms);
    }

    /// <summary>
    /// Create a new payment term
    /// </summary>
    [HttpPost]
    [RequirePermission("Configuration.PaymentTerm.Create")]
    [ProducesResponseType(typeof(PaymentTermDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaymentTermDto>> CreatePaymentTerm(
        [FromRoute] Guid tenantId,
        [FromBody] CreatePaymentTermRequest request)
    {
        try
        {
            var paymentTerm = await _paymentTermService.CreatePaymentTermAsync(request);
            _logger.LogInformation("Created payment term {TermCode} for tenant {TenantId}",
                paymentTerm.TermCode, tenantId);

            return CreatedAtAction(
                nameof(GetPaymentTerm),
                new { tenantId, id = paymentTerm.Id },
                paymentTerm);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create payment term: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing payment term
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Configuration.PaymentTerm.Edit")]
    [ProducesResponseType(typeof(PaymentTermDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentTermDto>> UpdatePaymentTerm(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdatePaymentTermRequest request)
    {
        try
        {
            var paymentTerm = await _paymentTermService.UpdatePaymentTermAsync(id, request);
            _logger.LogInformation("Updated payment term {TermCode} for tenant {TenantId}",
                paymentTerm.TermCode, tenantId);

            return Ok(paymentTerm);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment term not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update payment term {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a payment term (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Configuration.PaymentTerm.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeletePaymentTerm(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _paymentTermService.DeletePaymentTermAsync(id);
            _logger.LogInformation("Deleted payment term {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Payment term not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete payment term {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if term code exists
    /// </summary>
    [HttpGet("check-code/{code}")]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckTermCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _paymentTermService.TermCodeExistsAsync(code, excludeId);
        return Ok(new { exists });
    }

    /// <summary>
    /// Check if payment term has transactions
    /// </summary>
    [HttpGet("{id:guid}/has-transactions")]
    [RequirePermission("Configuration.PaymentTerm.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckPaymentTermHasTransactions(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var hasTransactions = await _paymentTermService.PaymentTermHasTransactionsAsync(id);
        return Ok(new { hasTransactions });
    }
}
