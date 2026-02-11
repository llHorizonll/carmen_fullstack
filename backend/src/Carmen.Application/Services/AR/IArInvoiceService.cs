using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AR;

public interface IArInvoiceService
{
    /// <summary>
    /// Get paginated list of AR invoices
    /// </summary>
    Task<PaginatedResult<ArInvoiceListDto>> GetInvoicesAsync(ArInvoiceQueryParams query);

    /// <summary>
    /// Get AR invoice by ID with lines
    /// </summary>
    Task<ArInvoiceDto?> GetInvoiceByIdAsync(Guid id);

    /// <summary>
    /// Get AR invoice by invoice number
    /// </summary>
    Task<ArInvoiceDto?> GetInvoiceByNumberAsync(string invoiceNumber);

    /// <summary>
    /// Create a new AR invoice (draft status)
    /// </summary>
    Task<ArInvoiceDto> CreateInvoiceAsync(CreateArInvoiceRequest request);

    /// <summary>
    /// Update an existing AR invoice (only if draft status)
    /// </summary>
    Task<ArInvoiceDto> UpdateInvoiceAsync(Guid id, UpdateArInvoiceRequest request);

    /// <summary>
    /// Delete an AR invoice (only if draft status)
    /// </summary>
    Task DeleteInvoiceAsync(Guid id);

    /// <summary>
    /// Submit AR invoice for approval
    /// </summary>
    Task<ArInvoiceDto> SubmitForApprovalAsync(Guid id, SubmitArInvoiceRequest request);

    /// <summary>
    /// Approve an AR invoice
    /// </summary>
    Task<ArInvoiceDto> ApproveInvoiceAsync(Guid id, ApproveArInvoiceRequest request);

    /// <summary>
    /// Reject an AR invoice
    /// </summary>
    Task<ArInvoiceDto> RejectInvoiceAsync(Guid id, RejectArInvoiceRequest request);

    /// <summary>
    /// Void an AR invoice
    /// </summary>
    Task<ArInvoiceDto> VoidInvoiceAsync(Guid id, VoidArInvoiceRequest request);

    /// <summary>
    /// Generate next invoice number
    /// </summary>
    Task<string> GenerateInvoiceNumberAsync(DateTime invoiceDate);

    /// <summary>
    /// Calculate taxes for an invoice
    /// </summary>
    Task<TaxCalculationResult> CalculateTaxesAsync(CalculateTaxRequest request);

    /// <summary>
    /// Get unpaid invoices for a customer (for receipt allocation)
    /// </summary>
    Task<List<UnpaidArInvoiceDto>> GetUnpaidInvoicesAsync(Guid customerId);

    /// <summary>
    /// Update invoice paid amount (called by receipt service)
    /// </summary>
    Task UpdateInvoicePaidAmountAsync(Guid invoiceId, decimal paidAmount);

    /// <summary>
    /// Validate invoice (customer exists, fiscal period open, etc.)
    /// </summary>
    Task<List<string>> ValidateInvoiceAsync(CreateArInvoiceRequest request);

    /// <summary>
    /// Check credit limit and return warning if exceeded
    /// </summary>
    Task<(bool IsExceeded, decimal CreditLimit, decimal CurrentBalance, decimal InvoiceAmount)>
        CheckCreditLimitAsync(Guid customerId, decimal invoiceAmount);
}
