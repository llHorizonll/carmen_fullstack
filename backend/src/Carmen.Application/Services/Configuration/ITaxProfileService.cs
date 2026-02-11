using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;

namespace Carmen.Application.Services.Configuration;

public interface ITaxProfileService
{
    /// <summary>
    /// Get paginated list of tax profiles
    /// </summary>
    Task<PaginatedResult<TaxProfileListDto>> GetTaxProfilesAsync(TaxProfileQueryParams query);

    /// <summary>
    /// Get tax profile by ID
    /// </summary>
    Task<TaxProfileDto?> GetTaxProfileByIdAsync(Guid id);

    /// <summary>
    /// Get tax profile by code
    /// </summary>
    Task<TaxProfileDto?> GetTaxProfileByCodeAsync(string taxCode);

    /// <summary>
    /// Get tax profiles for lookup (dropdown/select)
    /// </summary>
    Task<List<TaxProfileLookupDto>> GetTaxProfileLookupAsync(bool? isActive = null);

    /// <summary>
    /// Create a new tax profile
    /// </summary>
    Task<TaxProfileDto> CreateTaxProfileAsync(CreateTaxProfileRequest request);

    /// <summary>
    /// Update an existing tax profile
    /// </summary>
    Task<TaxProfileDto> UpdateTaxProfileAsync(Guid id, UpdateTaxProfileRequest request);

    /// <summary>
    /// Delete a tax profile (soft delete by setting IsActive = false)
    /// </summary>
    Task DeleteTaxProfileAsync(Guid id);

    /// <summary>
    /// Check if tax code exists
    /// </summary>
    Task<bool> TaxCodeExistsAsync(string taxCode, Guid? excludeId = null);

    /// <summary>
    /// Check if tax profile is used in transactions
    /// </summary>
    Task<bool> TaxProfileHasTransactionsAsync(Guid id);
}
