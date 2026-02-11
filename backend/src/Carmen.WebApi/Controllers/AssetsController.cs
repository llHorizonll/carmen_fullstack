using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Asset;
using Carmen.Domain.Entities.Asset;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Fixed asset management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;
    private readonly IAssetCategoryService _categoryService;
    private readonly ILogger<AssetsController> _logger;

    public AssetsController(
        IAssetService assetService,
        IAssetCategoryService categoryService,
        ILogger<AssetsController> logger)
    {
        _assetService = assetService;
        _categoryService = categoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of assets
    /// </summary>
    [HttpGet]
    [RequirePermission("Asset.Asset.View")]
    [ProducesResponseType(typeof(PaginatedResult<AssetListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<AssetListDto>>> GetAssets(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? departmentId,
        [FromQuery] AssetStatus? status,
        [FromQuery] DateTime? acquisitionDateFrom,
        [FromQuery] DateTime? acquisitionDateTo,
        [FromQuery] bool? isFullyDepreciated,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "AssetCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new AssetQueryParams(
            Search: search,
            CategoryId: categoryId,
            DepartmentId: departmentId,
            Status: status,
            AcquisitionDateFrom: acquisitionDateFrom,
            AcquisitionDateTo: acquisitionDateTo,
            IsFullyDepreciated: isFullyDepreciated,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _assetService.GetAssetsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get asset by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Asset.Asset.View")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> GetAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var asset = await _assetService.GetAssetByIdAsync(id);

        if (asset == null)
        {
            return NotFound(new { message = "Asset not found." });
        }

        return Ok(asset);
    }

    /// <summary>
    /// Get asset by code
    /// </summary>
    [HttpGet("by-code/{assetCode}")]
    [RequirePermission("Asset.Asset.View")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> GetAssetByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string assetCode)
    {
        var asset = await _assetService.GetAssetByCodeAsync(assetCode);

        if (asset == null)
        {
            return NotFound(new { message = "Asset not found." });
        }

        return Ok(asset);
    }

    /// <summary>
    /// Get asset lookup list for dropdowns
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Asset.Asset.View")]
    [ProducesResponseType(typeof(List<AssetLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AssetLookupDto>>> GetAssetLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] AssetStatus? status)
    {
        var result = await _assetService.GetAssetLookupAsync(search, status);
        return Ok(result);
    }

    /// <summary>
    /// Create a new asset
    /// </summary>
    [HttpPost]
    [RequirePermission("Asset.Asset.Create")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AssetDto>> CreateAsset(
        [FromRoute] Guid tenantId,
        [FromBody] CreateAssetRequest request)
    {
        try
        {
            var asset = await _assetService.CreateAssetAsync(request);
            _logger.LogInformation("Created asset {AssetCode} for tenant {TenantId}",
                asset.AssetCode, tenantId);

            return CreatedAtAction(
                nameof(GetAsset),
                new { tenantId, id = asset.Id },
                asset);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create asset: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing asset
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Asset.Asset.Edit")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> UpdateAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateAssetRequest request)
    {
        try
        {
            var asset = await _assetService.UpdateAssetAsync(id, request);
            _logger.LogInformation("Updated asset {AssetCode} for tenant {TenantId}",
                asset.AssetCode, tenantId);

            return Ok(asset);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update asset {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an asset
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Asset.Asset.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _assetService.DeleteAssetAsync(id);
            _logger.LogInformation("Deleted asset {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete asset {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Dispose an asset (sale, write-off, scrap, etc.)
    /// </summary>
    [HttpPost("{id:guid}/dispose")]
    [RequirePermission("Asset.Asset.Dispose")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> DisposeAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] DisposeAssetRequest request)
    {
        try
        {
            var asset = await _assetService.DisposeAssetAsync(id, request);
            _logger.LogInformation("Disposed asset {AssetCode} via {Method} for tenant {TenantId}",
                asset.AssetCode, request.DisposalMethod, tenantId);

            return Ok(asset);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to dispose asset {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Transfer an asset to a different department or location
    /// </summary>
    [HttpPost("{id:guid}/transfer")]
    [RequirePermission("Asset.Asset.Edit")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> TransferAsset(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] TransferAssetRequest request)
    {
        try
        {
            var asset = await _assetService.TransferAssetAsync(id, request);
            _logger.LogInformation("Transferred asset {AssetCode} to department {DepartmentId} for tenant {TenantId}",
                asset.AssetCode, request.NewDepartmentId, tenantId);

            return Ok(asset);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to transfer asset {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post asset disposal to GL
    /// </summary>
    [HttpPost("{id:guid}/post-disposal")]
    [RequirePermission("Asset.Asset.Dispose")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> PostDisposal(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var asset = await _assetService.PostDisposalAsync(id);
            _logger.LogInformation("Posted disposal for asset {AssetCode} for tenant {TenantId}",
                asset.AssetCode, tenantId);

            return Ok(asset);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to post disposal for asset {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Recalculate asset value based on depreciation
    /// </summary>
    [HttpPost("{id:guid}/recalculate")]
    [RequirePermission("Asset.Asset.Edit")]
    [ProducesResponseType(typeof(AssetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetDto>> RecalculateAssetValue(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _assetService.RecalculateAssetValueAsync(id);
            var asset = await _assetService.GetAssetByIdAsync(id);

            _logger.LogInformation("Recalculated value for asset {AssetCode} for tenant {TenantId}",
                asset?.AssetCode, tenantId);

            return Ok(asset);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Asset not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if asset code is unique
    /// </summary>
    [HttpGet("check-code/{assetCode}")]
    [RequirePermission("Asset.Asset.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckAssetCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string assetCode,
        [FromQuery] Guid? excludeId)
    {
        var isUnique = await _assetService.IsAssetCodeUniqueAsync(assetCode, excludeId);
        return Ok(new { isUnique });
    }

    /// <summary>
    /// Generate next asset code for a category
    /// </summary>
    [HttpGet("next-code/{categoryId:guid}")]
    [RequirePermission("Asset.Asset.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GenerateAssetCode(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid categoryId)
    {
        try
        {
            var assetCode = await _categoryService.GenerateAssetCodeAsync(categoryId);
            return Ok(new { assetCode });
        }
        catch (InvalidOperationException ex) when (ex.Message == "Category not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get asset register report
    /// </summary>
    [HttpGet("register")]
    [RequirePermission("Asset.Report.View")]
    [ProducesResponseType(typeof(List<AssetRegisterDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AssetRegisterDto>>> GetAssetRegister(
        [FromRoute] Guid tenantId,
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? departmentId,
        [FromQuery] AssetStatus? status,
        [FromQuery] DateTime? asOfDate)
    {
        var result = await _assetService.GetAssetRegisterAsync(
            categoryId, departmentId, status, asOfDate ?? DateTime.Today);
        return Ok(result);
    }
}
