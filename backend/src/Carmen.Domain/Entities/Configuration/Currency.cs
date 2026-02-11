using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Configuration;

/// <summary>
/// Represents a currency configuration for multi-currency support
/// </summary>
public class Currency : TenantEntity
{
    /// <summary>
    /// ISO 4217 currency code (e.g., USD, EUR, THB)
    /// </summary>
    public string CurrencyCode { get; set; } = string.Empty;

    /// <summary>
    /// Currency name in English
    /// </summary>
    public string CurrencyName { get; set; } = string.Empty;

    /// <summary>
    /// Currency name in local language
    /// </summary>
    public string? CurrencyNameLocal { get; set; }

    /// <summary>
    /// Currency symbol (e.g., $, EUR, B)
    /// </summary>
    public string Symbol { get; set; } = string.Empty;

    /// <summary>
    /// Number of decimal places for this currency
    /// </summary>
    public int DecimalPlaces { get; set; } = 2;

    /// <summary>
    /// Exchange rate to base currency
    /// </summary>
    public decimal ExchangeRate { get; set; } = 1.0m;

    /// <summary>
    /// Date when exchange rate was last updated
    /// </summary>
    public DateTime? ExchangeRateDate { get; set; }

    /// <summary>
    /// Whether this is the base/functional currency
    /// </summary>
    public bool IsBaseCurrency { get; set; }

    /// <summary>
    /// Display order for sorting
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Whether the currency is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
