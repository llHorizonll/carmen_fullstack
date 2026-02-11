using Carmen.Domain.Entities.AR;

namespace Carmen.Application.DTOs.AR;

// Response DTOs
public record ArInvoiceDto(
    Guid Id,
    string InvoiceNumber,
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    ArInvoiceStatus Status,
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal SubTotal,
    Guid? Tax1ProfileId,
    string? Tax1ProfileName,
    decimal? Tax1Rate,
    decimal Tax1Amount,
    Guid? Tax2ProfileId,
    string? Tax2ProfileName,
    decimal? Tax2Rate,
    decimal Tax2Amount,
    Guid? WhtProfileId,
    string? WhtProfileName,
    decimal? WhtRate,
    decimal WhtAmount,
    decimal TotalAmount,
    decimal NetAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    decimal SubTotalBase,
    decimal TotalAmountBase,
    decimal NetAmountBase,
    Guid? PaymentTermId,
    string? PaymentTermName,
    string? Description,
    string? Reference,
    Guid FiscalPeriodId,
    string? FiscalPeriodName,
    Guid? ArAccountId,
    string? ArAccountCode,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    DateTime? PostedAt,
    string? PostedBy,
    string? RejectionReason,
    string? VoidReason,
    Guid? JournalVoucherId,
    List<ArInvoiceLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record ArInvoiceListDto(
    Guid Id,
    string InvoiceNumber,
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    ArInvoiceStatus Status,
    string CustomerCode,
    string CustomerName,
    string CurrencyCode,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    int DaysOverdue,
    int LineCount,
    DateTime CreatedAt
);

public record ArInvoiceLineDto(
    Guid Id,
    int LineNumber,
    Guid AccountId,
    string AccountCode,
    string AccountName,
    string? Description,
    decimal Quantity,
    string? Unit,
    decimal UnitPrice,
    decimal Amount,
    decimal AmountBase,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal NetAmount,
    Guid? Tax1ProfileId,
    string? Tax1ProfileName,
    decimal Tax1Amount,
    Guid? DepartmentId,
    string? DepartmentName,
    string? ProjectCode
);

// Request DTOs
public record CreateArInvoiceRequest(
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    Guid CustomerId,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? Tax1ProfileId,
    Guid? Tax2ProfileId,
    Guid? WhtProfileId,
    Guid? PaymentTermId,
    string? Description,
    string? Reference,
    Guid FiscalPeriodId,
    Guid? ArAccountId,
    List<CreateArInvoiceLineRequest> Lines
);

public record CreateArInvoiceLineRequest(
    Guid AccountId,
    string? Description,
    decimal Quantity,
    string? Unit,
    decimal UnitPrice,
    decimal DiscountPercent,
    Guid? Tax1ProfileId,
    Guid? DepartmentId,
    string? ProjectCode
);

public record UpdateArInvoiceRequest(
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? Tax1ProfileId,
    Guid? Tax2ProfileId,
    Guid? WhtProfileId,
    Guid? PaymentTermId,
    string? Description,
    string? Reference,
    Guid FiscalPeriodId,
    Guid? ArAccountId,
    List<UpdateArInvoiceLineRequest> Lines
);

public record UpdateArInvoiceLineRequest(
    Guid? Id,  // Null for new lines
    Guid AccountId,
    string? Description,
    decimal Quantity,
    string? Unit,
    decimal UnitPrice,
    decimal DiscountPercent,
    Guid? Tax1ProfileId,
    Guid? DepartmentId,
    string? ProjectCode
);

// Action requests
public record SubmitArInvoiceRequest(
    string? Comment
);

public record ApproveArInvoiceRequest(
    string? Comment
);

public record RejectArInvoiceRequest(
    string Reason
);

public record VoidArInvoiceRequest(
    string Reason
);

// Query parameters
public record ArInvoiceQueryParams(
    string? Search,
    ArInvoiceStatus? Status,
    Guid? CustomerId,
    DateTime? DateFrom,
    DateTime? DateTo,
    DateTime? DueDateFrom,
    DateTime? DueDateTo,
    bool? HasBalance,
    Guid? FiscalPeriodId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "InvoiceDate",
    bool SortDescending = true
);

// Unpaid invoices for receipt allocation
public record UnpaidArInvoiceDto(
    Guid Id,
    string InvoiceNumber,
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    int DaysOverdue,
    string CurrencyCode,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount
);
