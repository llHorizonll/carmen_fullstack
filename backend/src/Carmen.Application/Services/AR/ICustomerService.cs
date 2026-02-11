using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AR;

public interface ICustomerService
{
    /// <summary>
    /// Get paginated list of customers
    /// </summary>
    Task<PaginatedResult<CustomerListDto>> GetCustomersAsync(CustomerQueryParams query);

    /// <summary>
    /// Get customer by ID
    /// </summary>
    Task<CustomerDto?> GetCustomerByIdAsync(Guid id);

    /// <summary>
    /// Get customer by code
    /// </summary>
    Task<CustomerDto?> GetCustomerByCodeAsync(string customerCode);

    /// <summary>
    /// Create a new customer
    /// </summary>
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request);

    /// <summary>
    /// Update an existing customer
    /// </summary>
    Task<CustomerDto> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request);

    /// <summary>
    /// Delete a customer (only if no transactions)
    /// </summary>
    Task DeleteCustomerAsync(Guid id);

    /// <summary>
    /// Get customer lookup list for dropdowns
    /// </summary>
    Task<List<CustomerLookupDto>> GetCustomerLookupAsync(string? search);

    /// <summary>
    /// Get customer aging detail
    /// </summary>
    Task<CustomerAgingDto> GetCustomerAgingAsync(Guid customerId, DateTime asOfDate);

    /// <summary>
    /// Get aging report for all customers
    /// </summary>
    Task<List<CustomerAgingSummaryDto>> GetAgingReportAsync(DateTime asOfDate);

    /// <summary>
    /// Update customer current balance
    /// </summary>
    Task UpdateCustomerBalanceAsync(Guid customerId);

    /// <summary>
    /// Check if customer code is unique
    /// </summary>
    Task<bool> IsCustomerCodeUniqueAsync(string customerCode, Guid? excludeId = null);
}
