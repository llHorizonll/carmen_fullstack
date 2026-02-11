using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AP;

public interface IApPaymentService
{
    /// <summary>
    /// Get paginated list of AP payments
    /// </summary>
    Task<PaginatedResult<ApPaymentListDto>> GetPaymentsAsync(ApPaymentQueryParams query);

    /// <summary>
    /// Get AP payment by ID with allocation lines
    /// </summary>
    Task<ApPaymentDto?> GetPaymentByIdAsync(Guid id);

    /// <summary>
    /// Get AP payment by payment number
    /// </summary>
    Task<ApPaymentDto?> GetPaymentByNumberAsync(string paymentNumber);

    /// <summary>
    /// Create a new AP payment (draft status)
    /// </summary>
    Task<ApPaymentDto> CreatePaymentAsync(CreateApPaymentRequest request);

    /// <summary>
    /// Update an existing AP payment (only if draft status)
    /// </summary>
    Task<ApPaymentDto> UpdatePaymentAsync(Guid id, UpdateApPaymentRequest request);

    /// <summary>
    /// Delete an AP payment (only if draft status)
    /// </summary>
    Task DeletePaymentAsync(Guid id);

    /// <summary>
    /// Approve an AP payment
    /// </summary>
    Task<ApPaymentDto> ApprovePaymentAsync(Guid id, ApproveApPaymentRequest request);

    /// <summary>
    /// Post an AP payment (creates GL journal voucher and updates invoice balances)
    /// </summary>
    Task<ApPaymentDto> PostPaymentAsync(Guid id, PostApPaymentRequest request);

    /// <summary>
    /// Void an AP payment (reverses GL journal voucher and restores invoice balances)
    /// </summary>
    Task<ApPaymentDto> VoidPaymentAsync(Guid id, VoidApPaymentRequest request);

    /// <summary>
    /// Generate next payment number
    /// </summary>
    Task<string> GeneratePaymentNumberAsync(DateTime paymentDate);

    /// <summary>
    /// Auto-allocate payment amount to invoices using FIFO
    /// </summary>
    Task<AutoAllocateResult> AutoAllocateAsync(AutoAllocateRequest request);

    /// <summary>
    /// Validate payment (vendor exists, bank account valid, allocations valid, etc.)
    /// </summary>
    Task<List<string>> ValidatePaymentAsync(CreateApPaymentRequest request);

    /// <summary>
    /// Calculate exchange gain/loss for payment allocation
    /// </summary>
    Task<decimal> CalculateExchangeGainLossAsync(
        Guid invoiceId,
        decimal allocationAmount,
        decimal paymentExchangeRate);
}
