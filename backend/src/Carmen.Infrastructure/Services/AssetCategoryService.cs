using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Asset;
using Carmen.Domain.Entities.Asset;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class AssetCategoryService : IAssetCategoryService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AssetCategoryService> _logger;

    public AssetCategoryService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AssetCategoryService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<AssetCategoryListDto>> GetCategoriesAsync(AssetCategoryQueryParams query)
    {
        var queryable = _context.AssetCategories
            .Include(c => c.Assets)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(c =>
                c.CategoryCode.ToLower().Contains(search) ||
                c.CategoryName.ToLower().Contains(search) ||
                (c.CategoryNameLocal != null && c.CategoryNameLocal.ToLower().Contains(search)) ||
                (c.Description != null && c.Description.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(c => c.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "categoryname" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CategoryName)
                : queryable.OrderBy(c => c.CategoryName),
            "defaultusefullifemonths" => query.SortDescending
                ? queryable.OrderByDescending(c => c.DefaultUsefulLifeMonths)
                : queryable.OrderBy(c => c.DefaultUsefulLifeMonths),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CreatedAt)
                : queryable.OrderBy(c => c.CreatedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(c => c.CategoryCode)
                : queryable.OrderBy(c => c.CategoryCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new AssetCategoryListDto(
                c.Id,
                c.CategoryCode,
                c.CategoryName,
                c.Description,
                c.IsActive,
                c.DefaultUsefulLifeMonths,
                c.DefaultDepreciationMethod,
                c.DefaultSalvagePercent,
                c.AssetCodePrefix,
                c.Assets.Count,
                c.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<AssetCategoryListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<AssetCategoryDto?> GetCategoryByIdAsync(Guid id)
    {
        var category = await _context.AssetCategories
            .Include(c => c.DefaultAssetAccount)
            .Include(c => c.DefaultAccumDepreciationAccount)
            .Include(c => c.DefaultDepreciationExpenseAccount)
            .Include(c => c.DefaultGainLossAccount)
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category == null ? null : MapToDto(category);
    }

    public async Task<AssetCategoryDto?> GetCategoryByCodeAsync(string categoryCode)
    {
        var category = await _context.AssetCategories
            .Include(c => c.DefaultAssetAccount)
            .Include(c => c.DefaultAccumDepreciationAccount)
            .Include(c => c.DefaultDepreciationExpenseAccount)
            .Include(c => c.DefaultGainLossAccount)
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.CategoryCode == categoryCode);

        return category == null ? null : MapToDto(category);
    }

    public async Task<AssetCategoryDto> CreateCategoryAsync(CreateAssetCategoryRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Check category code uniqueness
        if (!await IsCategoryCodeUniqueAsync(request.CategoryCode))
        {
            throw new InvalidOperationException($"Category code '{request.CategoryCode}' already exists.");
        }

        var category = new AssetCategory
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CategoryCode = request.CategoryCode,
            CategoryName = request.CategoryName,
            CategoryNameLocal = request.CategoryNameLocal,
            Description = request.Description,
            IsActive = true,
            DefaultUsefulLifeMonths = request.DefaultUsefulLifeMonths,
            DefaultDepreciationMethod = request.DefaultDepreciationMethod,
            DefaultSalvagePercent = request.DefaultSalvagePercent,
            DefaultAssetAccountId = request.DefaultAssetAccountId,
            DefaultAccumDepreciationAccountId = request.DefaultAccumDepreciationAccountId,
            DefaultDepreciationExpenseAccountId = request.DefaultDepreciationExpenseAccountId,
            DefaultGainLossAccountId = request.DefaultGainLossAccountId,
            AssetCodePrefix = request.AssetCodePrefix,
            Notes = request.Notes,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.AssetCategories.Add(category);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created asset category {CategoryCode} with ID {Id}", category.CategoryCode, category.Id);

        return await GetCategoryByIdAsync(category.Id)
            ?? throw new InvalidOperationException("Failed to retrieve created category.");
    }

    public async Task<AssetCategoryDto> UpdateCategoryAsync(Guid id, UpdateAssetCategoryRequest request)
    {
        var category = await _context.AssetCategories.FindAsync(id)
            ?? throw new InvalidOperationException("Category not found.");

        category.CategoryName = request.CategoryName;
        category.CategoryNameLocal = request.CategoryNameLocal;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        category.DefaultUsefulLifeMonths = request.DefaultUsefulLifeMonths;
        category.DefaultDepreciationMethod = request.DefaultDepreciationMethod;
        category.DefaultSalvagePercent = request.DefaultSalvagePercent;
        category.DefaultAssetAccountId = request.DefaultAssetAccountId;
        category.DefaultAccumDepreciationAccountId = request.DefaultAccumDepreciationAccountId;
        category.DefaultDepreciationExpenseAccountId = request.DefaultDepreciationExpenseAccountId;
        category.DefaultGainLossAccountId = request.DefaultGainLossAccountId;
        category.AssetCodePrefix = request.AssetCodePrefix;
        category.Notes = request.Notes;
        category.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated asset category {CategoryCode} with ID {Id}", category.CategoryCode, category.Id);

        return await GetCategoryByIdAsync(category.Id)
            ?? throw new InvalidOperationException("Failed to retrieve updated category.");
    }

    public async Task DeleteCategoryAsync(Guid id)
    {
        var category = await _context.AssetCategories
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new InvalidOperationException("Category not found.");

        if (category.Assets.Any())
        {
            throw new InvalidOperationException($"Cannot delete category with {category.Assets.Count} assets. Please reassign or delete assets first.");
        }

        _context.AssetCategories.Remove(category);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted asset category {CategoryCode} with ID {Id}", category.CategoryCode, category.Id);
    }

    public async Task<List<AssetCategoryLookupDto>> GetCategoryLookupAsync(string? search)
    {
        var queryable = _context.AssetCategories
            .Where(c => c.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            queryable = queryable.Where(c =>
                c.CategoryCode.ToLower().Contains(searchLower) ||
                c.CategoryName.ToLower().Contains(searchLower));
        }

        return await queryable
            .OrderBy(c => c.CategoryCode)
            .Take(50)
            .Select(c => new AssetCategoryLookupDto(
                c.Id,
                c.CategoryCode,
                c.CategoryName,
                c.DefaultUsefulLifeMonths,
                c.DefaultDepreciationMethod,
                c.DefaultSalvagePercent,
                c.DefaultAssetAccountId,
                c.DefaultAccumDepreciationAccountId,
                c.DefaultDepreciationExpenseAccountId,
                c.DefaultGainLossAccountId,
                c.AssetCodePrefix))
            .ToListAsync();
    }

    public async Task<bool> IsCategoryCodeUniqueAsync(string categoryCode, Guid? excludeId = null)
    {
        var query = _context.AssetCategories
            .Where(c => c.CategoryCode == categoryCode);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }

    public async Task<string> GenerateAssetCodeAsync(Guid categoryId)
    {
        var category = await _context.AssetCategories.FindAsync(categoryId)
            ?? throw new InvalidOperationException("Category not found.");

        var prefix = category.AssetCodePrefix ?? category.CategoryCode;

        // Find the highest existing code with this prefix
        var existingCodes = await _context.Assets
            .Where(a => a.AssetCode.StartsWith(prefix))
            .Select(a => a.AssetCode)
            .ToListAsync();

        int maxNumber = 0;
        foreach (var code in existingCodes)
        {
            var suffix = code.Substring(prefix.Length);
            if (int.TryParse(suffix, out int num) && num > maxNumber)
            {
                maxNumber = num;
            }
        }

        return $"{prefix}{(maxNumber + 1):D5}";
    }

    private static AssetCategoryDto MapToDto(AssetCategory category)
    {
        return new AssetCategoryDto(
            category.Id,
            category.CategoryCode,
            category.CategoryName,
            category.CategoryNameLocal,
            category.Description,
            category.IsActive,
            category.DefaultUsefulLifeMonths,
            category.DefaultDepreciationMethod,
            category.DefaultSalvagePercent,
            category.DefaultAssetAccountId,
            category.DefaultAssetAccount?.AccountCode,
            category.DefaultAssetAccount?.AccountName,
            category.DefaultAccumDepreciationAccountId,
            category.DefaultAccumDepreciationAccount?.AccountCode,
            category.DefaultAccumDepreciationAccount?.AccountName,
            category.DefaultDepreciationExpenseAccountId,
            category.DefaultDepreciationExpenseAccount?.AccountCode,
            category.DefaultDepreciationExpenseAccount?.AccountName,
            category.DefaultGainLossAccountId,
            category.DefaultGainLossAccount?.AccountCode,
            category.DefaultGainLossAccount?.AccountName,
            category.AssetCodePrefix,
            category.Notes,
            category.Assets?.Count ?? 0,
            category.CreatedAt,
            category.CreatedBy,
            category.UpdatedAt
        );
    }
}
