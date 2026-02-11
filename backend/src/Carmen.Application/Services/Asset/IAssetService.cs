using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Domain.Entities.Asset;

namespace Carmen.Application.Services.Asset;

public interface IAssetService
{
    /// <summary>
    /// Get paginated list of assets
    /// </summary>
    Task<PaginatedResult<AssetListDto>> GetAssetsAsync(AssetQueryParams query);

    /// <summary>
    /// Get asset by ID with full details
    /// </summary>
    Task<AssetDto?> GetAssetByIdAsync(Guid id);

    /// <summary>
    /// Get asset by code
    /// </summary>
    Task<AssetDto?> GetAssetByCodeAsync(string assetCode);

    /// <summary>
    /// Create a new asset
    /// </summary>
    Task<AssetDto> CreateAssetAsync(CreateAssetRequest request);

    /// <summary>
    /// Update an existing asset (only if Active)
    /// </summary>
    Task<AssetDto> UpdateAssetAsync(Guid id, UpdateAssetRequest request);

    /// <summary>
    /// Delete an asset (only if no depreciation posted)
    /// </summary>
    Task DeleteAssetAsync(Guid id);

    /// <summary>
    /// Get asset lookup list for dropdowns
    /// </summary>
    Task<List<AssetLookupDto>> GetAssetLookupAsync(string? search, AssetStatus? status = null);

    /// <summary>
    /// Dispose/retire an asset
    /// </summary>
    Task<AssetDto> DisposeAssetAsync(Guid id, DisposeAssetRequest request);

    /// <summary>
    /// Transfer an asset to another department/location
    /// </summary>
    Task<AssetDto> TransferAssetAsync(Guid id, TransferAssetRequest request);

    /// <summary>
    /// Check if asset code is unique
    /// </summary>
    Task<bool> IsAssetCodeUniqueAsync(string assetCode, Guid? excludeId = null);

    /// <summary>
    /// Recalculate asset's current value and accumulated depreciation
    /// </summary>
    Task RecalculateAssetValueAsync(Guid assetId);

    /// <summary>
    /// Get asset register report data
    /// </summary>
    Task<List<AssetRegisterDto>> GetAssetRegisterAsync(Guid? categoryId, Guid? departmentId, AssetStatus? status, DateTime asOfDate);

    /// <summary>
    /// Get disposal record for an asset
    /// </summary>
    Task<AssetDisposalDto?> GetAssetDisposalAsync(Guid assetId);

    /// <summary>
    /// Post disposal to GL
    /// </summary>
    Task<AssetDto> PostDisposalAsync(Guid assetId);
}
