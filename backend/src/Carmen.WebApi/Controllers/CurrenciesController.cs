using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Services.Configuration;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Currency management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/currencies")]
[Authorize]
public class CurrenciesController : ControllerBase
{
    private readonly ICurrencyService _currencyService;
    private readonly ILogger<CurrenciesController> _logger;

    public CurrenciesController(
        ICurrencyService currencyService,
        ILogger<CurrenciesController> logger)
    {
        _currencyService = currencyService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of currencies
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="search">Search term for code/name</param>
    /// <param name="isActive">Filter by active status</param>
    /// <param name="isBaseCurrency">Filter by base currency</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <param name="sortBy">Sort field (default: CurrencyCode)</param>
    /// <param name="sortDescending">Sort descending (default: false)</param>
    [HttpGet]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(PaginatedResult<CurrencyListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<CurrencyListDto>>> GetCurrencies(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isBaseCurrency,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "CurrencyCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new CurrencyQueryParams(
            Search: search,
            IsActive: isActive,
            IsBaseCurrency: isBaseCurrency,
            Page: page,
            PageSize: Math.Min(pageSize, 100), // Max 100 items per page
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _currencyService.GetCurrenciesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get currency by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(CurrencyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CurrencyDto>> GetCurrency(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var currency = await _currencyService.GetCurrencyByIdAsync(id);

        if (currency == null)
        {
            return NotFound(new { message = "Currency not found." });
        }

        return Ok(currency);
    }

    /// <summary>
    /// Get currency by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(CurrencyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CurrencyDto>> GetCurrencyByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code)
    {
        var currency = await _currencyService.GetCurrencyByCodeAsync(code);

        if (currency == null)
        {
            return NotFound(new { message = "Currency not found." });
        }

        return Ok(currency);
    }

    /// <summary>
    /// Get currencies for lookup (dropdown/select)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(List<CurrencyLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CurrencyLookupDto>>> GetCurrencyLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] bool? isActive)
    {
        var currencies = await _currencyService.GetCurrencyLookupAsync(isActive);
        return Ok(currencies);
    }

    /// <summary>
    /// Create a new currency
    /// </summary>
    [HttpPost]
    [RequirePermission("Configuration.Currency.Create")]
    [ProducesResponseType(typeof(CurrencyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CurrencyDto>> CreateCurrency(
        [FromRoute] Guid tenantId,
        [FromBody] CreateCurrencyRequest request)
    {
        try
        {
            var currency = await _currencyService.CreateCurrencyAsync(request);
            _logger.LogInformation("Created currency {CurrencyCode} for tenant {TenantId}",
                currency.CurrencyCode, tenantId);

            return CreatedAtAction(
                nameof(GetCurrency),
                new { tenantId, id = currency.Id },
                currency);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create currency: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing currency
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Configuration.Currency.Edit")]
    [ProducesResponseType(typeof(CurrencyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CurrencyDto>> UpdateCurrency(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateCurrencyRequest request)
    {
        try
        {
            var currency = await _currencyService.UpdateCurrencyAsync(id, request);
            _logger.LogInformation("Updated currency {CurrencyCode} for tenant {TenantId}",
                currency.CurrencyCode, tenantId);

            return Ok(currency);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Currency not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update currency {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a currency (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Configuration.Currency.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCurrency(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _currencyService.DeleteCurrencyAsync(id);
            _logger.LogInformation("Deleted currency {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Currency not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete currency {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if currency code exists
    /// </summary>
    [HttpGet("check-code/{code}")]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckCurrencyCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _currencyService.CurrencyCodeExistsAsync(code, excludeId);
        return Ok(new { exists });
    }

    /// <summary>
    /// Check if currency has transactions
    /// </summary>
    [HttpGet("{id:guid}/has-transactions")]
    [RequirePermission("Configuration.Currency.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckCurrencyHasTransactions(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var hasTransactions = await _currencyService.CurrencyHasTransactionsAsync(id);
        return Ok(new { hasTransactions });
    }

    /// <summary>
    /// Update exchange rate for a currency
    /// </summary>
    [HttpPut("{id:guid}/exchange-rate")]
    [RequirePermission("Configuration.Currency.Edit")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateExchangeRate(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateExchangeRateRequest request)
    {
        try
        {
            await _currencyService.UpdateExchangeRateAsync(id, request.ExchangeRate);
            _logger.LogInformation("Updated exchange rate for currency {Id} to {Rate} for tenant {TenantId}",
                id, request.ExchangeRate, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Currency not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update exchange rate for currency {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }
}

/// <summary>
/// Request to update exchange rate
/// </summary>
public record UpdateExchangeRateRequest(decimal ExchangeRate);
