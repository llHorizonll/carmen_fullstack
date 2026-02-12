using Carmen.Domain.Entities.GL;

namespace Carmen.Application.DTOs.GL;

// Response DTOs
public record JournalVoucherDto(
    Guid Id,
    string VoucherNumber,
    DateTime VoucherDate,
    DateTime PostingDate,
    VoucherType VoucherType,
    DocumentStatus Status,
    string? Description,
    string? Reference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalDebit,
    decimal TotalCredit,
    Guid FiscalPeriodId,
    string? FiscalPeriodName,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    DateTime? PostedAt,
    string? PostedBy,
    Guid? ReversalOfId,
    Guid? ReversedById,
    List<JournalVoucherLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record JournalVoucherListDto(
    Guid Id,
    string VoucherNumber,
    DateTime VoucherDate,
    DateTime PostingDate,
    VoucherType VoucherType,
    DocumentStatus Status,
    string? Description,
    string CurrencyCode,
    decimal TotalDebit,
    decimal TotalCredit,
    int LineCount,
    DateTime CreatedAt,
    string CreatedBy
);

public record JournalVoucherLineDto(
    Guid Id,
    int LineNumber,
    Guid AccountId,
    string AccountCode,
    string AccountName,
    decimal DebitAmount,
    decimal CreditAmount,
    decimal DebitAmountBase,
    decimal CreditAmountBase,
    string? Description,
    string? Reference,
    Guid? DepartmentId,
    string? DepartmentName
);

// Request DTOs
public record CreateJournalVoucherRequest(
    DateTime VoucherDate,
    DateTime PostingDate,
    VoucherType VoucherType,
    string? Description,
    string? Reference,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? FiscalPeriodId,
    List<CreateJournalVoucherLineRequest> Lines
);

public record CreateJournalVoucherLineRequest(
    Guid AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? Reference,
    Guid? DepartmentId
);

public record UpdateJournalVoucherRequest(
    DateTime VoucherDate,
    DateTime PostingDate,
    string? Description,
    string? Reference,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? FiscalPeriodId,
    List<UpdateJournalVoucherLineRequest> Lines
);

public record UpdateJournalVoucherLineRequest(
    Guid? Id,  // Null for new lines
    Guid AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? Reference,
    Guid? DepartmentId
);

// Action requests
public record SubmitForApprovalRequest(
    string? Comment
);

public record ApproveVoucherRequest(
    string? Comment
);

public record RejectVoucherRequest(
    string Reason
);

public record PostVoucherRequest(
    DateTime? PostingDate
);

public record ReverseVoucherRequest(
    DateTime ReversalDate,
    string? Description
);

// Query parameters
public record JournalVoucherQueryParams(
    string? Search,
    DocumentStatus? Status,
    VoucherType? VoucherType,
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? FiscalPeriodId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "VoucherDate",
    bool SortDescending = true
);
