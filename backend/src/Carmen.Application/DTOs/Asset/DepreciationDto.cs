using Carmen.Domain.Entities.Asset;

namespace Carmen.Application.DTOs.Asset;

// Response DTOs
public record DepreciationScheduleDto(
    Guid Id,
    Guid AssetId,
    string AssetCode,
    string AssetName,
    Guid FiscalPeriodId,
    string FiscalPeriodName,
    int ScheduleNumber,
    DateTime ScheduleDate,
    decimal OpeningValue,
    decimal DepreciationAmount,
    decimal DepreciationAmountBase,
    decimal ClosingValue,
    decimal AccumulatedDepreciation,
    bool IsPosted,
    Guid? JournalVoucherId,
    string? JournalVoucherNumber,
    DateTime? PostedAt,
    string? PostedBy,
    string? Notes,
    DateTime CreatedAt
);

public record DepreciationScheduleListDto(
    Guid Id,
    Guid AssetId,
    string AssetCode,
    string AssetName,
    string CategoryName,
    string FiscalPeriodName,
    DateTime ScheduleDate,
    decimal DepreciationAmount,
    decimal AccumulatedDepreciation,
    decimal ClosingValue,
    bool IsPosted,
    DateTime? PostedAt
);

// Request DTOs
public record RunDepreciationRequest(
    Guid FiscalPeriodId,
    bool AutoPost = false
);

public record PostDepreciationRequest(
    string? Notes
);

// Query parameters
public record DepreciationQueryParams(
    Guid? AssetId,
    Guid? FiscalPeriodId,
    bool? IsPosted,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "ScheduleDate",
    bool SortDescending = true
);

// Summary DTOs
public record DepreciationSummaryDto(
    Guid FiscalPeriodId,
    string FiscalPeriodName,
    int TotalAssets,
    int AssetsDepreciated,
    decimal TotalDepreciationAmount,
    decimal TotalDepreciationAmountBase,
    int PostedCount,
    int UnpostedCount
);

public record DepreciationForecastDto(
    int Month,
    DateTime PeriodDate,
    decimal OpeningValue,
    decimal DepreciationAmount,
    decimal ClosingValue,
    decimal AccumulatedDepreciation,
    bool IsProjected
);

// Disposal DTO
public record AssetDisposalDto(
    Guid Id,
    Guid AssetId,
    string AssetCode,
    string AssetName,
    DateTime DisposalDate,
    DisposalMethod DisposalMethod,
    decimal DisposalValue,
    decimal DisposalCost,
    decimal NetProceeds,
    decimal BookValueAtDisposal,
    decimal AccumulatedDepreciationAtDisposal,
    decimal GainLossAmount,
    string? BuyerName,
    string? Reference,
    string? Reason,
    string? Notes,
    bool IsPosted,
    Guid? JournalVoucherId,
    string? JournalVoucherNumber,
    DateTime? PostedAt,
    string? PostedBy,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    DateTime CreatedAt,
    string CreatedBy
);
