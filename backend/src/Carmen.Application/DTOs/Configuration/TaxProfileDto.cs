using Carmen.Domain.Entities.Configuration;

namespace Carmen.Application.DTOs.Configuration;

// Response DTOs
public record TaxProfileDto(
    Guid Id,
    string TaxCode,
    string TaxName,
    string? TaxNameLocal,
    TaxType TaxType,
    TaxCalculationMethod CalculationMethod,
    decimal TaxRate,
    string? Description,
    bool IsActive,
    bool IsDefault,
    Guid? TaxPayableAccountId,
    string? TaxPayableAccountCode,
    string? TaxPayableAccountName,
    Guid? TaxReceivableAccountId,
    string? TaxReceivableAccountCode,
    string? TaxReceivableAccountName,
    int SortOrder,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record TaxProfileListDto(
    Guid Id,
    string TaxCode,
    string TaxName,
    TaxType TaxType,
    decimal TaxRate,
    bool IsActive,
    bool IsDefault
);

public record TaxProfileLookupDto(
    Guid Id,
    string TaxCode,
    string TaxName,
    decimal TaxRate
);

// Request DTOs
public record CreateTaxProfileRequest(
    string TaxCode,
    string TaxName,
    string? TaxNameLocal,
    TaxType TaxType,
    TaxCalculationMethod CalculationMethod,
    decimal TaxRate,
    string? Description,
    bool IsDefault,
    Guid? TaxPayableAccountId,
    Guid? TaxReceivableAccountId,
    int SortOrder = 0
);

public record UpdateTaxProfileRequest(
    string TaxName,
    string? TaxNameLocal,
    TaxType TaxType,
    TaxCalculationMethod CalculationMethod,
    decimal TaxRate,
    string? Description,
    bool IsActive,
    bool IsDefault,
    Guid? TaxPayableAccountId,
    Guid? TaxReceivableAccountId,
    int SortOrder
);

// Query parameters
public record TaxProfileQueryParams(
    string? Search,
    TaxType? TaxType,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "TaxCode",
    bool SortDescending = false
);
