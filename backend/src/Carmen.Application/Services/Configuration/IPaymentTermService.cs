using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;

namespace Carmen.Application.Services.Configuration;

public interface IPaymentTermService
{
    /// <summary>
    /// Get paginated list of payment terms
    /// </summary>
    Task<PaginatedResult<PaymentTermListDto>> GetPaymentTermsAsync(PaymentTermQueryParams query);

    /// <summary>
    /// Get payment term by ID
    /// </summary>
    Task<PaymentTermDto?> GetPaymentTermByIdAsync(Guid id);

    /// <summary>
    /// Get payment term by code
    /// </summary>
    Task<PaymentTermDto?> GetPaymentTermByCodeAsync(string termCode);

    /// <summary>
    /// Get payment terms for lookup (dropdown/select)
    /// </summary>
    Task<List<PaymentTermLookupDto>> GetPaymentTermLookupAsync(bool? isActive = null);

    /// <summary>
    /// Create a new payment term
    /// </summary>
    Task<PaymentTermDto> CreatePaymentTermAsync(CreatePaymentTermRequest request);

    /// <summary>
    /// Update an existing payment term
    /// </summary>
    Task<PaymentTermDto> UpdatePaymentTermAsync(Guid id, UpdatePaymentTermRequest request);

    /// <summary>
    /// Delete a payment term (soft delete by setting IsActive = false)
    /// </summary>
    Task DeletePaymentTermAsync(Guid id);

    /// <summary>
    /// Check if term code exists
    /// </summary>
    Task<bool> TermCodeExistsAsync(string termCode, Guid? excludeId = null);

    /// <summary>
    /// Check if payment term is used in transactions
    /// </summary>
    Task<bool> PaymentTermHasTransactionsAsync(Guid id);
}
