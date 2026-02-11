using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.AP;

public interface IVendorService
{
    /// <summary>
    /// Get paginated list of vendors
    /// </summary>
    Task<PaginatedResult<VendorListDto>> GetVendorsAsync(VendorQueryParams query);

    /// <summary>
    /// Get vendor by ID
    /// </summary>
    Task<VendorDto?> GetVendorByIdAsync(Guid id);

    /// <summary>
    /// Get vendor by code
    /// </summary>
    Task<VendorDto?> GetVendorByCodeAsync(string vendorCode);

    /// <summary>
    /// Create a new vendor
    /// </summary>
    Task<VendorDto> CreateVendorAsync(CreateVendorRequest request);

    /// <summary>
    /// Update an existing vendor
    /// </summary>
    Task<VendorDto> UpdateVendorAsync(Guid id, UpdateVendorRequest request);

    /// <summary>
    /// Delete a vendor (only if no transactions)
    /// </summary>
    Task DeleteVendorAsync(Guid id);

    /// <summary>
    /// Get vendor lookup list for dropdowns
    /// </summary>
    Task<List<VendorLookupDto>> GetVendorLookupAsync(string? search);

    /// <summary>
    /// Get vendor aging detail
    /// </summary>
    Task<VendorAgingDto> GetVendorAgingAsync(Guid vendorId, DateTime asOfDate);

    /// <summary>
    /// Get aging report for all vendors
    /// </summary>
    Task<List<VendorAgingSummaryDto>> GetAgingReportAsync(DateTime asOfDate);

    /// <summary>
    /// Update vendor current balance
    /// </summary>
    Task UpdateVendorBalanceAsync(Guid vendorId);

    /// <summary>
    /// Check if vendor code is unique
    /// </summary>
    Task<bool> IsVendorCodeUniqueAsync(string vendorCode, Guid? excludeId = null);
}
