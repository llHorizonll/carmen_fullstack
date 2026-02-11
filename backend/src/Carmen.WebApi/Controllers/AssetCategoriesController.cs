using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Services.Asset;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Asset category management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/asset-categories")]
[Authorize]
public class AssetCategoriesController : ControllerBase
{
    private readonly IAssetCategoryService _categoryService;
    private readonly ILogger<AssetCategoriesController> _logger;

    public AssetCategoriesController(
        IAssetCategoryService categoryService,
        ILogger<AssetCategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of asset categories
    /// </summary>
    [HttpGet]
    [RequirePermission("Asset.Category.View")]
    [ProducesResponseType(typeof(PaginatedResult<AssetCategoryListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<AssetCategoryListDto>>> GetCategories(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "CategoryCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new AssetCategoryQueryParams(
            Search: search,
            IsActive: isActive,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _categoryService.GetCategoriesAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get asset category by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Asset.Category.View")]
    [ProducesResponseType(typeof(AssetCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetCategoryDto>> GetCategory(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);

        if (category == null)
        {
            return NotFound(new { message = "Asset category not found." });
        }

        return Ok(category);
    }

    /// <summary>
    /// Get asset category by code
    /// </summary>
    [HttpGet("by-code/{categoryCode}")]
    [RequirePermission("Asset.Category.View")]
    [ProducesResponseType(typeof(AssetCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetCategoryDto>> GetCategoryByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string categoryCode)
    {
        var category = await _categoryService.GetCategoryByCodeAsync(categoryCode);

        if (category == null)
        {
            return NotFound(new { message = "Asset category not found." });
        }

        return Ok(category);
    }

    /// <summary>
    /// Get asset category lookup list for dropdowns
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Asset.Category.View")]
    [ProducesResponseType(typeof(List<AssetCategoryLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AssetCategoryLookupDto>>> GetCategoryLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search)
    {
        var result = await _categoryService.GetCategoryLookupAsync(search);
        return Ok(result);
    }

    /// <summary>
    /// Create a new asset category
    /// </summary>
    [HttpPost]
    [RequirePermission("Asset.Category.Create")]
    [ProducesResponseType(typeof(AssetCategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AssetCategoryDto>> CreateCategory(
        [FromRoute] Guid tenantId,
        [FromBody] CreateAssetCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.CreateCategoryAsync(request);
            _logger.LogInformation("Created asset category {CategoryCode} for tenant {TenantId}",
                category.CategoryCode, tenantId);

            return CreatedAtAction(
                nameof(GetCategory),
                new { tenantId, id = category.Id },
                category);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create asset category: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing asset category
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Asset.Category.Edit")]
    [ProducesResponseType(typeof(AssetCategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AssetCategoryDto>> UpdateCategory(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateAssetCategoryRequest request)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, request);
            _logger.LogInformation("Updated asset category {CategoryCode} for tenant {TenantId}",
                category.CategoryCode, tenantId);

            return Ok(category);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Category not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update asset category {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an asset category
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Asset.Category.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCategory(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _categoryService.DeleteCategoryAsync(id);
            _logger.LogInformation("Deleted asset category {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Category not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete asset category {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if category code is unique
    /// </summary>
    [HttpGet("check-code/{categoryCode}")]
    [RequirePermission("Asset.Category.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckCategoryCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string categoryCode,
        [FromQuery] Guid? excludeId)
    {
        var isUnique = await _categoryService.IsCategoryCodeUniqueAsync(categoryCode, excludeId);
        return Ok(new { isUnique });
    }

    /// <summary>
    /// Generate next asset code for a category
    /// </summary>
    [HttpGet("{id:guid}/next-asset-code")]
    [RequirePermission("Asset.Asset.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GenerateAssetCode(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            var assetCode = await _categoryService.GenerateAssetCodeAsync(id);
            return Ok(new { assetCode });
        }
        catch (InvalidOperationException ex) when (ex.Message == "Category not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
