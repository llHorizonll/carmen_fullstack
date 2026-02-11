using Carmen.Domain.Entities.Asset;

namespace Carmen.Application.DTOs.Asset;

// Response DTOs
public record AssetCategoryDto(
    Guid Id,
    string CategoryCode,
    string CategoryName,
    string? CategoryNameLocal,
    string? Description,
    bool IsActive,
    int DefaultUsefulLifeMonths,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultSalvagePercent,
    Guid? DefaultAssetAccountId,
    string? DefaultAssetAccountCode,
    string? DefaultAssetAccountName,
    Guid? DefaultAccumDepreciationAccountId,
    string? DefaultAccumDepreciationAccountCode,
    string? DefaultAccumDepreciationAccountName,
    Guid? DefaultDepreciationExpenseAccountId,
    string? DefaultDepreciationExpenseAccountCode,
    string? DefaultDepreciationExpenseAccountName,
    Guid? DefaultGainLossAccountId,
    string? DefaultGainLossAccountCode,
    string? DefaultGainLossAccountName,
    string? AssetCodePrefix,
    string? Notes,
    int AssetCount,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record AssetCategoryListDto(
    Guid Id,
    string CategoryCode,
    string CategoryName,
    string? Description,
    bool IsActive,
    int DefaultUsefulLifeMonths,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultSalvagePercent,
    string? AssetCodePrefix,
    int AssetCount,
    DateTime CreatedAt
);

public record AssetCategoryLookupDto(
    Guid Id,
    string CategoryCode,
    string CategoryName,
    int DefaultUsefulLifeMonths,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultSalvagePercent,
    Guid? DefaultAssetAccountId,
    Guid? DefaultAccumDepreciationAccountId,
    Guid? DefaultDepreciationExpenseAccountId,
    Guid? DefaultGainLossAccountId,
    string? AssetCodePrefix
);

// Request DTOs
public record CreateAssetCategoryRequest(
    string CategoryCode,
    string CategoryName,
    string? CategoryNameLocal,
    string? Description,
    int DefaultUsefulLifeMonths,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultSalvagePercent,
    Guid? DefaultAssetAccountId,
    Guid? DefaultAccumDepreciationAccountId,
    Guid? DefaultDepreciationExpenseAccountId,
    Guid? DefaultGainLossAccountId,
    string? AssetCodePrefix,
    string? Notes
);

public record UpdateAssetCategoryRequest(
    string CategoryName,
    string? CategoryNameLocal,
    string? Description,
    bool IsActive,
    int DefaultUsefulLifeMonths,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultSalvagePercent,
    Guid? DefaultAssetAccountId,
    Guid? DefaultAccumDepreciationAccountId,
    Guid? DefaultDepreciationExpenseAccountId,
    Guid? DefaultGainLossAccountId,
    string? AssetCodePrefix,
    string? Notes
);

// Query parameters
public record AssetCategoryQueryParams(
    string? Search,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "CategoryCode",
    bool SortDescending = false
);
