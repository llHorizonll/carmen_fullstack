using Carmen.Domain.Entities.GL;

namespace Carmen.Application.DTOs.GL;

// Response DTOs
public record AccountDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    string? AccountNameLocal,
    AccountType AccountType,
    Guid? ParentAccountId,
    string? ParentAccountCode,
    string? ParentAccountName,
    int Level,
    bool IsHeader,
    bool IsActive,
    string? Description,
    string CurrencyCode,
    bool AllowPosting,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AccountTreeDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    int Level,
    bool IsHeader,
    bool IsActive,
    bool AllowPosting,
    List<AccountTreeDto> Children
);

public record AccountListDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    int Level,
    bool IsHeader,
    bool IsActive,
    bool AllowPosting
);

public record AccountLookupDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    AccountType AccountType
);

// Request DTOs
public record CreateAccountRequest(
    string AccountCode,
    string AccountName,
    string? AccountNameLocal,
    AccountType AccountType,
    Guid? ParentAccountId,
    bool IsHeader,
    string? Description,
    string CurrencyCode,
    bool AllowPosting
);

public record UpdateAccountRequest(
    string AccountName,
    string? AccountNameLocal,
    Guid? ParentAccountId,
    bool IsHeader,
    string? Description,
    string CurrencyCode,
    bool AllowPosting,
    bool IsActive
);

// Query parameters
public record AccountQueryParams(
    string? Search,
    AccountType? AccountType,
    bool? IsActive,
    bool? IsHeader,
    Guid? ParentAccountId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "AccountCode",
    bool SortDescending = false
);
