namespace Carmen.Application.DTOs.Configuration;

// Response DTOs
public record PaymentTermDto(
    Guid Id,
    string TermCode,
    string TermName,
    string? TermNameLocal,
    int DueDays,
    decimal? DiscountPercent,
    int? DiscountDays,
    string? Description,
    bool IsDefault,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record PaymentTermListDto(
    Guid Id,
    string TermCode,
    string TermName,
    string? TermNameLocal,
    int DueDays,
    decimal? DiscountPercent,
    bool IsDefault,
    bool IsActive
);

public record PaymentTermLookupDto(
    Guid Id,
    string TermCode,
    string TermName,
    int DueDays
);

// Request DTOs
public record CreatePaymentTermRequest(
    string TermCode,
    string TermName,
    string? TermNameLocal,
    int DueDays,
    decimal? DiscountPercent,
    int? DiscountDays,
    string? Description,
    bool IsDefault,
    int SortOrder = 0
);

public record UpdatePaymentTermRequest(
    string TermName,
    string? TermNameLocal,
    int DueDays,
    decimal? DiscountPercent,
    int? DiscountDays,
    string? Description,
    bool IsDefault,
    int SortOrder,
    bool IsActive
);

// Query parameters
public record PaymentTermQueryParams(
    string? Search,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "TermCode",
    bool SortDescending = false
);
