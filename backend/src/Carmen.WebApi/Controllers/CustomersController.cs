using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.AR;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Customer management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(
        ICustomerService customerService,
        ILogger<CustomersController> logger)
    {
        _customerService = customerService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of customers
    /// </summary>
    [HttpGet]
    [RequirePermission("AR.Customer.View")]
    [ProducesResponseType(typeof(PaginatedResult<CustomerListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<CustomerListDto>>> GetCustomers(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "CustomerCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new CustomerQueryParams(
            Search: search,
            IsActive: isActive,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _customerService.GetCustomersAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("AR.Customer.View")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDto>> GetCustomer(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found." });
        }

        return Ok(customer);
    }

    /// <summary>
    /// Get customer by code
    /// </summary>
    [HttpGet("by-code/{customerCode}")]
    [RequirePermission("AR.Customer.View")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDto>> GetCustomerByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string customerCode)
    {
        var customer = await _customerService.GetCustomerByCodeAsync(customerCode);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found." });
        }

        return Ok(customer);
    }

    /// <summary>
    /// Get customer lookup list for dropdowns
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("AR.Customer.View")]
    [ProducesResponseType(typeof(List<CustomerLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CustomerLookupDto>>> GetCustomerLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search)
    {
        var result = await _customerService.GetCustomerLookupAsync(search);
        return Ok(result);
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    [HttpPost]
    [RequirePermission("AR.Customer.Create")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(
        [FromRoute] Guid tenantId,
        [FromBody] CreateCustomerRequest request)
    {
        try
        {
            var customer = await _customerService.CreateCustomerAsync(request);
            _logger.LogInformation("Created customer {CustomerCode} for tenant {TenantId}",
                customer.CustomerCode, tenantId);

            return CreatedAtAction(
                nameof(GetCustomer),
                new { tenantId, id = customer.Id },
                customer);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create customer: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing customer
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("AR.Customer.Edit")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateCustomerRequest request)
    {
        try
        {
            var customer = await _customerService.UpdateCustomerAsync(id, request);
            _logger.LogInformation("Updated customer {CustomerCode} for tenant {TenantId}",
                customer.CustomerCode, tenantId);

            return Ok(customer);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Customer not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update customer {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("AR.Customer.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCustomer(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _customerService.DeleteCustomerAsync(id);
            _logger.LogInformation("Deleted customer {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Customer not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete customer {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get customer aging detail
    /// </summary>
    [HttpGet("{id:guid}/aging")]
    [RequirePermission("AR.Report.View")]
    [ProducesResponseType(typeof(CustomerAgingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerAgingDto>> GetCustomerAging(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromQuery] DateTime? asOfDate)
    {
        try
        {
            var aging = await _customerService.GetCustomerAgingAsync(id, asOfDate ?? DateTime.Today);
            return Ok(aging);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Customer not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get aging report for all customers
    /// </summary>
    [HttpGet("aging-report")]
    [RequirePermission("AR.Report.View")]
    [ProducesResponseType(typeof(List<CustomerAgingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CustomerAgingSummaryDto>>> GetAgingReport(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? asOfDate)
    {
        var result = await _customerService.GetAgingReportAsync(asOfDate ?? DateTime.Today);
        return Ok(result);
    }

    /// <summary>
    /// Check if customer code is unique
    /// </summary>
    [HttpGet("check-code/{customerCode}")]
    [RequirePermission("AR.Customer.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckCustomerCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string customerCode,
        [FromQuery] Guid? excludeId)
    {
        var isUnique = await _customerService.IsCustomerCodeUniqueAsync(customerCode, excludeId);
        return Ok(new { isUnique });
    }
}
