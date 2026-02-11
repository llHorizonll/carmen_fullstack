using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AR;

public interface IArReceiptService
{
    /// <summary>
    /// Get paginated list of AR receipts
    /// </summary>
    Task<PaginatedResult<ArReceiptListDto>> GetReceiptsAsync(ArReceiptQueryParams query);

    /// <summary>
    /// Get AR receipt by ID with allocation lines
    /// </summary>
    Task<ArReceiptDto?> GetReceiptByIdAsync(Guid id);

    /// <summary>
    /// Get AR receipt by receipt number
    /// </summary>
    Task<ArReceiptDto?> GetReceiptByNumberAsync(string receiptNumber);

    /// <summary>
    /// Create a new AR receipt (draft status)
    /// </summary>
    Task<ArReceiptDto> CreateReceiptAsync(CreateArReceiptRequest request);

    /// <summary>
    /// Update an existing AR receipt (only if draft status)
    /// </summary>
    Task<ArReceiptDto> UpdateReceiptAsync(Guid id, UpdateArReceiptRequest request);

    /// <summary>
    /// Delete an AR receipt (only if draft status)
    /// </summary>
    Task DeleteReceiptAsync(Guid id);

    /// <summary>
    /// Approve an AR receipt
    /// </summary>
    Task<ArReceiptDto> ApproveReceiptAsync(Guid id, ApproveArReceiptRequest request);

    /// <summary>
    /// Post an AR receipt (creates GL journal voucher and updates invoice balances)
    /// </summary>
    Task<ArReceiptDto> PostReceiptAsync(Guid id, PostArReceiptRequest request);

    /// <summary>
    /// Void an AR receipt (reverses GL journal voucher and restores invoice balances)
    /// </summary>
    Task<ArReceiptDto> VoidReceiptAsync(Guid id, VoidArReceiptRequest request);

    /// <summary>
    /// Generate next receipt number
    /// </summary>
    Task<string> GenerateReceiptNumberAsync(DateTime receiptDate);

    /// <summary>
    /// Auto-allocate receipt amount to invoices using FIFO
    /// </summary>
    Task<ArAutoAllocateResult> AutoAllocateAsync(ArAutoAllocateRequest request);

    /// <summary>
    /// Validate receipt (customer exists, bank account valid, allocations valid, etc.)
    /// </summary>
    Task<List<string>> ValidateReceiptAsync(CreateArReceiptRequest request);

    /// <summary>
    /// Calculate exchange gain/loss for receipt allocation
    /// </summary>
    Task<decimal> CalculateExchangeGainLossAsync(
        Guid invoiceId,
        decimal allocationAmount,
        decimal receiptExchangeRate);
}
