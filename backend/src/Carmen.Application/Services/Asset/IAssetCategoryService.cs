using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;

namespace Carmen.Application.Services.Asset;

public interface IAssetCategoryService
{
    /// <summary>
    /// Get paginated list of asset categories
    /// </summary>
    Task<PaginatedResult<AssetCategoryListDto>> GetCategoriesAsync(AssetCategoryQueryParams query);

    /// <summary>
    /// Get asset category by ID
    /// </summary>
    Task<AssetCategoryDto?> GetCategoryByIdAsync(Guid id);

    /// <summary>
    /// Get asset category by code
    /// </summary>
    Task<AssetCategoryDto?> GetCategoryByCodeAsync(string categoryCode);

    /// <summary>
    /// Create a new asset category
    /// </summary>
    Task<AssetCategoryDto> CreateCategoryAsync(CreateAssetCategoryRequest request);

    /// <summary>
    /// Update an existing asset category
    /// </summary>
    Task<AssetCategoryDto> UpdateCategoryAsync(Guid id, UpdateAssetCategoryRequest request);

    /// <summary>
    /// Delete an asset category (only if no assets)
    /// </summary>
    Task DeleteCategoryAsync(Guid id);

    /// <summary>
    /// Get asset category lookup list for dropdowns
    /// </summary>
    Task<List<AssetCategoryLookupDto>> GetCategoryLookupAsync(string? search);

    /// <summary>
    /// Check if category code is unique
    /// </summary>
    Task<bool> IsCategoryCodeUniqueAsync(string categoryCode, Guid? excludeId = null);

    /// <summary>
    /// Get next available asset code for a category
    /// </summary>
    Task<string> GenerateAssetCodeAsync(Guid categoryId);
}
