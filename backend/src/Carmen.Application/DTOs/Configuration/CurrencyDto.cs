namespace Carmen.Application.DTOs.Configuration;

// Response DTOs
public record CurrencyDto(
    Guid Id,
    string CurrencyCode,
    string CurrencyName,
    string? CurrencyNameLocal,
    string Symbol,
    int DecimalPlaces,
    decimal ExchangeRate,
    DateTime? ExchangeRateDate,
    bool IsBaseCurrency,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CurrencyListDto(
    Guid Id,
    string CurrencyCode,
    string CurrencyName,
    string Symbol,
    int DecimalPlaces,
    decimal ExchangeRate,
    bool IsBaseCurrency,
    bool IsActive
);

public record CurrencyLookupDto(
    Guid Id,
    string CurrencyCode,
    string CurrencyName,
    string Symbol,
    int DecimalPlaces
);

// Request DTOs
public record CreateCurrencyRequest(
    string CurrencyCode,
    string CurrencyName,
    string? CurrencyNameLocal,
    string Symbol,
    int DecimalPlaces,
    decimal ExchangeRate,
    bool IsBaseCurrency,
    int SortOrder = 0
);

public record UpdateCurrencyRequest(
    string CurrencyName,
    string? CurrencyNameLocal,
    string Symbol,
    int DecimalPlaces,
    decimal ExchangeRate,
    DateTime? ExchangeRateDate,
    bool IsBaseCurrency,
    int SortOrder,
    bool IsActive
);

// Query parameters
public record CurrencyQueryParams(
    string? Search,
    bool? IsActive,
    bool? IsBaseCurrency,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "CurrencyCode",
    bool SortDescending = false
);
