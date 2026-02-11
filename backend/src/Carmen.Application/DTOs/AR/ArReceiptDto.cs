using Carmen.Domain.Entities.AR;

namespace Carmen.Application.DTOs.AR;

// Response DTOs
public record ArReceiptDto(
    Guid Id,
    string ReceiptNumber,
    DateTime ReceiptDate,
    ArReceiptStatus Status,
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    ReceiptMethod ReceiptMethod,
    string? CheckNumber,
    DateTime? CheckDate,
    string? BankReference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalAmount,
    decimal TotalAmountBase,
    decimal AllocatedAmount,
    decimal UnallocatedAmount,
    Guid BankAccountId,
    string BankAccountCode,
    string BankAccountName,
    string? Description,
    string? Reference,
    string? PayerName,
    Guid FiscalPeriodId,
    string? FiscalPeriodName,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    DateTime? PostedAt,
    string? PostedBy,
    string? VoidReason,
    Guid? JournalVoucherId,
    List<ArReceiptLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record ArReceiptListDto(
    Guid Id,
    string ReceiptNumber,
    DateTime ReceiptDate,
    ArReceiptStatus Status,
    string CustomerCode,
    string CustomerName,
    ReceiptMethod ReceiptMethod,
    string? CheckNumber,
    string CurrencyCode,
    decimal TotalAmount,
    string BankAccountCode,
    int AllocationCount,
    DateTime CreatedAt
);

public record ArReceiptLineDto(
    Guid Id,
    int LineNumber,
    Guid ArInvoiceId,
    string InvoiceNumber,
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    decimal InvoiceTotalAmount,
    decimal InvoiceBalanceBefore,
    decimal AmountAllocated,
    decimal AmountAllocatedBase,
    decimal DiscountAmount,
    decimal WhtAmount,
    decimal ExchangeGainLoss,
    string? Notes
);

// Request DTOs
public record CreateArReceiptRequest(
    DateTime ReceiptDate,
    Guid CustomerId,
    ReceiptMethod ReceiptMethod,
    string? CheckNumber,
    DateTime? CheckDate,
    string? BankReference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalAmount,
    Guid BankAccountId,
    string? Description,
    string? Reference,
    string? PayerName,
    Guid FiscalPeriodId,
    List<CreateArReceiptLineRequest> Lines
);

public record CreateArReceiptLineRequest(
    Guid ArInvoiceId,
    decimal AmountAllocated,
    decimal DiscountAmount,
    decimal WhtAmount,
    string? Notes
);

public record UpdateArReceiptRequest(
    DateTime ReceiptDate,
    ReceiptMethod ReceiptMethod,
    string? CheckNumber,
    DateTime? CheckDate,
    string? BankReference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalAmount,
    Guid BankAccountId,
    string? Description,
    string? Reference,
    string? PayerName,
    Guid FiscalPeriodId,
    List<UpdateArReceiptLineRequest> Lines
);

public record UpdateArReceiptLineRequest(
    Guid? Id,  // Null for new lines
    Guid ArInvoiceId,
    decimal AmountAllocated,
    decimal DiscountAmount,
    decimal WhtAmount,
    string? Notes
);

// Action requests
public record ApproveArReceiptRequest(
    string? Comment
);

public record PostArReceiptRequest(
    DateTime? PostingDate
);

public record VoidArReceiptRequest(
    string Reason
);

// Query parameters
public record ArReceiptQueryParams(
    string? Search,
    ArReceiptStatus? Status,
    Guid? CustomerId,
    ReceiptMethod? ReceiptMethod,
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? FiscalPeriodId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "ReceiptDate",
    bool SortDescending = true
);

// Auto-allocation request (FIFO)
public record ArAutoAllocateRequest(
    Guid CustomerId,
    decimal TotalAmount,
    string CurrencyCode
);

public record ArAutoAllocateResult(
    decimal TotalAllocated,
    decimal Remaining,
    List<ArAllocationSuggestion> Allocations
);

public record ArAllocationSuggestion(
    Guid InvoiceId,
    string InvoiceNumber,
    DateTime DueDate,
    decimal InvoiceBalance,
    decimal SuggestedAmount,
    decimal WhtAmount
);
