using Carmen.Domain.Entities.AP;

namespace Carmen.Application.DTOs.AP;

// Response DTOs
public record ApPaymentDto(
    Guid Id,
    string PaymentNumber,
    DateTime PaymentDate,
    ApPaymentStatus Status,
    Guid VendorId,
    string VendorCode,
    string VendorName,
    PaymentMethod PaymentMethod,
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
    string? PayeeName,
    Guid FiscalPeriodId,
    string? FiscalPeriodName,
    DateTime? ApprovedAt,
    string? ApprovedBy,
    DateTime? PostedAt,
    string? PostedBy,
    string? VoidReason,
    Guid? JournalVoucherId,
    List<ApPaymentLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record ApPaymentListDto(
    Guid Id,
    string PaymentNumber,
    DateTime PaymentDate,
    ApPaymentStatus Status,
    string VendorCode,
    string VendorName,
    PaymentMethod PaymentMethod,
    string? CheckNumber,
    string CurrencyCode,
    decimal TotalAmount,
    string BankAccountCode,
    int AllocationCount,
    DateTime CreatedAt
);

public record ApPaymentLineDto(
    Guid Id,
    int LineNumber,
    Guid ApInvoiceId,
    string InvoiceNumber,
    string? VendorInvoiceNumber,
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
public record CreateApPaymentRequest(
    DateTime PaymentDate,
    Guid VendorId,
    PaymentMethod PaymentMethod,
    string? CheckNumber,
    DateTime? CheckDate,
    string? BankReference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalAmount,
    Guid BankAccountId,
    string? Description,
    string? Reference,
    string? PayeeName,
    Guid FiscalPeriodId,
    List<CreateApPaymentLineRequest> Lines
);

public record CreateApPaymentLineRequest(
    Guid ApInvoiceId,
    decimal AmountAllocated,
    decimal DiscountAmount,
    decimal WhtAmount,
    string? Notes
);

public record UpdateApPaymentRequest(
    DateTime PaymentDate,
    PaymentMethod PaymentMethod,
    string? CheckNumber,
    DateTime? CheckDate,
    string? BankReference,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal TotalAmount,
    Guid BankAccountId,
    string? Description,
    string? Reference,
    string? PayeeName,
    Guid FiscalPeriodId,
    List<UpdateApPaymentLineRequest> Lines
);

public record UpdateApPaymentLineRequest(
    Guid? Id,  // Null for new lines
    Guid ApInvoiceId,
    decimal AmountAllocated,
    decimal DiscountAmount,
    decimal WhtAmount,
    string? Notes
);

// Action requests
public record ApproveApPaymentRequest(
    string? Comment
);

public record PostApPaymentRequest(
    DateTime? PostingDate
);

public record VoidApPaymentRequest(
    string Reason
);

// Query parameters
public record ApPaymentQueryParams(
    string? Search,
    ApPaymentStatus? Status,
    Guid? VendorId,
    PaymentMethod? PaymentMethod,
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? FiscalPeriodId,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "PaymentDate",
    bool SortDescending = true
);

// Auto-allocation request (FIFO)
public record AutoAllocateRequest(
    Guid VendorId,
    decimal TotalAmount,
    string CurrencyCode
);

public record AutoAllocateResult(
    decimal TotalAllocated,
    decimal Remaining,
    List<AllocationSuggestion> Allocations
);

public record AllocationSuggestion(
    Guid InvoiceId,
    string InvoiceNumber,
    DateTime DueDate,
    decimal InvoiceBalance,
    decimal SuggestedAmount,
    decimal WhtAmount
);
