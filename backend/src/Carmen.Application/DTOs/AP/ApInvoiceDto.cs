using Carmen.Domain.Entities.AP;

namespace Carmen.Application.DTOs.AP;

// Response DTOs
public record ApInvoiceDto(
    Guid Id,
    string InvoiceNumber,
    string? VendorInvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    ApInvoiceStatus Status,
    Guid VendorId,
    string VendorCode,
    string VendorName,
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
    Guid? ApAccountId,
    string? ApAccountCode,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    DateTime? PostedAt,
    string? PostedBy,
    string? RejectionReason,
    string? VoidReason,
    Guid? JournalVoucherId,
    List<ApInvoiceLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record ApInvoiceListDto(
    Guid Id,
    string InvoiceNumber,
    string? VendorInvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    ApInvoiceStatus Status,
    string VendorCode,
    string VendorName,
    string CurrencyCode,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount,
    int DaysOverdue,
    int LineCount,
    DateTime CreatedAt
);

public record ApInvoiceLineDto(
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
public record CreateApInvoiceRequest(
    string? VendorInvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    Guid VendorId,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? Tax1ProfileId,
    Guid? Tax2ProfileId,
    Guid? WhtProfileId,
    Guid? PaymentTermId,
    string? Description,
    string? Reference,
    Guid FiscalPeriodId,
    Guid? ApAccountId,
    List<CreateApInvoiceLineRequest> Lines
);

public record CreateApInvoiceLineRequest(
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

public record UpdateApInvoiceRequest(
    string? VendorInvoiceNumber,
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
    Guid? ApAccountId,
    List<UpdateApInvoiceLineRequest> Lines
);

public record UpdateApInvoiceLineRequest(
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
public record SubmitApInvoiceRequest(
    string? Comment
);

public record ApproveApInvoiceRequest(
    string? Comment
);

public record RejectApInvoiceRequest(
    string Reason
);

public record VoidApInvoiceRequest(
    string Reason
);

// Tax calculation
public record CalculateTaxRequest(
    decimal SubTotal,
    Guid? Tax1ProfileId,
    Guid? Tax2ProfileId,
    Guid? WhtProfileId
);

public record TaxCalculationResult(
    decimal SubTotal,
    Guid? Tax1ProfileId,
    string? Tax1ProfileName,
    decimal Tax1Rate,
    decimal Tax1Amount,
    Guid? Tax2ProfileId,
    string? Tax2ProfileName,
    decimal Tax2Rate,
    decimal Tax2Amount,
    Guid? WhtProfileId,
    string? WhtProfileName,
    decimal WhtRate,
    decimal WhtAmount,
    decimal TotalAmount,
    decimal NetAmount
);

// Query parameters
public record ApInvoiceQueryParams(
    string? Search,
    ApInvoiceStatus? Status,
    Guid? VendorId,
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

// Unpaid invoices for payment allocation
public record UnpaidInvoiceDto(
    Guid Id,
    string InvoiceNumber,
    string? VendorInvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    int DaysOverdue,
    string CurrencyCode,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal BalanceAmount
);
