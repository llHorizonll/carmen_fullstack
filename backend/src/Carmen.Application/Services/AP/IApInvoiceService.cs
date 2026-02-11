using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AP;

public interface IApInvoiceService
{
    /// <summary>
    /// Get paginated list of AP invoices
    /// </summary>
    Task<PaginatedResult<ApInvoiceListDto>> GetInvoicesAsync(ApInvoiceQueryParams query);

    /// <summary>
    /// Get AP invoice by ID with lines
    /// </summary>
    Task<ApInvoiceDto?> GetInvoiceByIdAsync(Guid id);

    /// <summary>
    /// Get AP invoice by invoice number
    /// </summary>
    Task<ApInvoiceDto?> GetInvoiceByNumberAsync(string invoiceNumber);

    /// <summary>
    /// Create a new AP invoice (draft status)
    /// </summary>
    Task<ApInvoiceDto> CreateInvoiceAsync(CreateApInvoiceRequest request);

    /// <summary>
    /// Update an existing AP invoice (only if draft status)
    /// </summary>
    Task<ApInvoiceDto> UpdateInvoiceAsync(Guid id, UpdateApInvoiceRequest request);

    /// <summary>
    /// Delete an AP invoice (only if draft status)
    /// </summary>
    Task DeleteInvoiceAsync(Guid id);

    /// <summary>
    /// Submit AP invoice for approval
    /// </summary>
    Task<ApInvoiceDto> SubmitForApprovalAsync(Guid id, SubmitApInvoiceRequest request);

    /// <summary>
    /// Approve an AP invoice
    /// </summary>
    Task<ApInvoiceDto> ApproveInvoiceAsync(Guid id, ApproveApInvoiceRequest request);

    /// <summary>
    /// Reject an AP invoice
    /// </summary>
    Task<ApInvoiceDto> RejectInvoiceAsync(Guid id, RejectApInvoiceRequest request);

    /// <summary>
    /// Void an AP invoice
    /// </summary>
    Task<ApInvoiceDto> VoidInvoiceAsync(Guid id, VoidApInvoiceRequest request);

    /// <summary>
    /// Generate next invoice number
    /// </summary>
    Task<string> GenerateInvoiceNumberAsync(DateTime invoiceDate);

    /// <summary>
    /// Calculate taxes for an invoice
    /// </summary>
    Task<TaxCalculationResult> CalculateTaxesAsync(CalculateTaxRequest request);

    /// <summary>
    /// Get unpaid invoices for a vendor (for payment allocation)
    /// </summary>
    Task<List<UnpaidInvoiceDto>> GetUnpaidInvoicesAsync(Guid vendorId);

    /// <summary>
    /// Update invoice paid amount (called by payment service)
    /// </summary>
    Task UpdateInvoicePaidAmountAsync(Guid invoiceId, decimal paidAmount);

    /// <summary>
    /// Validate invoice (vendor exists, fiscal period open, etc.)
    /// </summary>
    Task<List<string>> ValidateInvoiceAsync(CreateApInvoiceRequest request);

    /// <summary>
    /// Check credit limit and return warning if exceeded
    /// </summary>
    Task<(bool IsExceeded, decimal CreditLimit, decimal CurrentBalance, decimal InvoiceAmount)>
        CheckCreditLimitAsync(Guid vendorId, decimal invoiceAmount);
}
