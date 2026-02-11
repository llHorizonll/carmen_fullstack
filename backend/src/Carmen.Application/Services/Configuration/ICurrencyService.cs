using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;

namespace Carmen.Application.Services.Configuration;

public interface ICurrencyService
{
    /// <summary>
    /// Get paginated list of currencies
    /// </summary>
    Task<PaginatedResult<CurrencyListDto>> GetCurrenciesAsync(CurrencyQueryParams query);

    /// <summary>
    /// Get currency by ID
    /// </summary>
    Task<CurrencyDto?> GetCurrencyByIdAsync(Guid id);

    /// <summary>
    /// Get currency by code
    /// </summary>
    Task<CurrencyDto?> GetCurrencyByCodeAsync(string currencyCode);

    /// <summary>
    /// Get currencies for lookup (dropdown/select)
    /// </summary>
    Task<List<CurrencyLookupDto>> GetCurrencyLookupAsync(bool? isActive = null);

    /// <summary>
    /// Create a new currency
    /// </summary>
    Task<CurrencyDto> CreateCurrencyAsync(CreateCurrencyRequest request);

    /// <summary>
    /// Update an existing currency
    /// </summary>
    Task<CurrencyDto> UpdateCurrencyAsync(Guid id, UpdateCurrencyRequest request);

    /// <summary>
    /// Delete a currency (soft delete by setting IsActive = false)
    /// </summary>
    Task DeleteCurrencyAsync(Guid id);

    /// <summary>
    /// Check if currency code exists
    /// </summary>
    Task<bool> CurrencyCodeExistsAsync(string currencyCode, Guid? excludeId = null);

    /// <summary>
    /// Check if currency is used in transactions
    /// </summary>
    Task<bool> CurrencyHasTransactionsAsync(Guid id);

    /// <summary>
    /// Update exchange rate for a currency
    /// </summary>
    Task UpdateExchangeRateAsync(Guid id, decimal exchangeRate);
}
