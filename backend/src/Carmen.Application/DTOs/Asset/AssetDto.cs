using Carmen.Domain.Entities.Asset;

namespace Carmen.Application.DTOs.Asset;

// Response DTOs
public record AssetDto(
    Guid Id,
    string AssetCode,
    string AssetName,
    string? AssetNameLocal,
    string? Description,
    string? SerialNumber,
    string? Barcode,
    Guid AssetCategoryId,
    string CategoryCode,
    string CategoryName,
    string? LocationDescription,
    Guid? DepartmentId,
    string? DepartmentName,
    AssetCondition Condition,
    DateTime AcquisitionDate,
    decimal AcquisitionCost,
    string CurrencyCode,
    decimal ExchangeRate,
    decimal AcquisitionCostBase,
    Guid? VendorId,
    string? VendorCode,
    string? VendorName,
    Guid? ApInvoiceId,
    string? ApInvoiceNumber,
    string? PurchaseReference,
    DepreciationMethod DepreciationMethod,
    int UsefulLifeMonths,
    decimal SalvageValue,
    DateTime DepreciationStartDate,
    decimal MonthlyDepreciation,
    AssetStatus Status,
    decimal AccumulatedDepreciation,
    decimal CurrentValue,
    int DepreciatedMonths,
    bool IsFullyDepreciated,
    Guid? AssetAccountId,
    string? AssetAccountCode,
    string? AssetAccountName,
    Guid? AccumDepreciationAccountId,
    string? AccumDepreciationAccountCode,
    string? AccumDepreciationAccountName,
    Guid? DepreciationExpenseAccountId,
    string? DepreciationExpenseAccountCode,
    string? DepreciationExpenseAccountName,
    DateTime? DisposedAt,
    decimal? DisposalValue,
    decimal? GainLossAmount,
    string? Notes,
    List<DepreciationScheduleDto> DepreciationSchedules,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record AssetListDto(
    Guid Id,
    string AssetCode,
    string AssetName,
    string CategoryCode,
    string CategoryName,
    string? LocationDescription,
    string? DepartmentName,
    AssetCondition Condition,
    DateTime AcquisitionDate,
    decimal AcquisitionCost,
    string CurrencyCode,
    DepreciationMethod DepreciationMethod,
    AssetStatus Status,
    decimal AccumulatedDepreciation,
    decimal CurrentValue,
    bool IsFullyDepreciated,
    DateTime CreatedAt
);

public record AssetLookupDto(
    Guid Id,
    string AssetCode,
    string AssetName,
    string CategoryName,
    AssetStatus Status,
    decimal CurrentValue
);

// Request DTOs
public record CreateAssetRequest(
    string AssetCode,
    string AssetName,
    string? AssetNameLocal,
    string? Description,
    string? SerialNumber,
    string? Barcode,
    Guid AssetCategoryId,
    string? LocationDescription,
    Guid? DepartmentId,
    AssetCondition Condition,
    DateTime AcquisitionDate,
    decimal AcquisitionCost,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid? VendorId,
    Guid? ApInvoiceId,
    string? PurchaseReference,
    DepreciationMethod DepreciationMethod,
    int UsefulLifeMonths,
    decimal SalvageValue,
    DateTime DepreciationStartDate,
    Guid? AssetAccountId,
    Guid? AccumDepreciationAccountId,
    Guid? DepreciationExpenseAccountId,
    string? Notes
);

public record UpdateAssetRequest(
    string AssetName,
    string? AssetNameLocal,
    string? Description,
    string? SerialNumber,
    string? Barcode,
    Guid AssetCategoryId,
    string? LocationDescription,
    Guid? DepartmentId,
    AssetCondition Condition,
    DepreciationMethod DepreciationMethod,
    int UsefulLifeMonths,
    decimal SalvageValue,
    Guid? AssetAccountId,
    Guid? AccumDepreciationAccountId,
    Guid? DepreciationExpenseAccountId,
    string? Notes
);

public record DisposeAssetRequest(
    DateTime DisposalDate,
    DisposalMethod DisposalMethod,
    decimal DisposalValue,
    decimal DisposalCost,
    string? BuyerName,
    string? Reference,
    string? Reason,
    string? Notes
);

public record TransferAssetRequest(
    Guid NewDepartmentId,
    string? NewLocationDescription,
    string? Notes
);

// Query parameters
public record AssetQueryParams(
    string? Search,
    Guid? CategoryId,
    AssetStatus? Status,
    Guid? DepartmentId,
    DateTime? AcquisitionDateFrom,
    DateTime? AcquisitionDateTo,
    bool? IsFullyDepreciated,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "AssetCode",
    bool SortDescending = false
);

// Asset register report DTO
public record AssetRegisterDto(
    Guid Id,
    string AssetCode,
    string AssetName,
    string CategoryCode,
    string CategoryName,
    string? DepartmentName,
    DateTime AcquisitionDate,
    decimal AcquisitionCost,
    string CurrencyCode,
    DepreciationMethod DepreciationMethod,
    int UsefulLifeMonths,
    decimal SalvageValue,
    decimal MonthlyDepreciation,
    decimal AccumulatedDepreciation,
    decimal CurrentValue,
    AssetStatus Status
);
