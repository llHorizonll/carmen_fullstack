using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Domain.Entities.Asset;

namespace Carmen.Application.Services.Asset;

public interface IDepreciationService
{
    /// <summary>
    /// Get paginated list of depreciation schedules
    /// </summary>
    Task<PaginatedResult<DepreciationScheduleListDto>> GetSchedulesAsync(DepreciationQueryParams query);

    /// <summary>
    /// Get depreciation schedule by ID
    /// </summary>
    Task<DepreciationScheduleDto?> GetScheduleByIdAsync(Guid id);

    /// <summary>
    /// Get all depreciation schedules for an asset
    /// </summary>
    Task<List<DepreciationScheduleDto>> GetSchedulesByAssetAsync(Guid assetId);

    /// <summary>
    /// Generate full depreciation schedule for an asset
    /// </summary>
    Task<List<DepreciationScheduleDto>> GenerateScheduleAsync(Guid assetId);

    /// <summary>
    /// Run monthly depreciation for all active assets in a fiscal period
    /// </summary>
    Task<List<DepreciationScheduleDto>> RunMonthlyDepreciationAsync(RunDepreciationRequest request);

    /// <summary>
    /// Post a single depreciation schedule to GL
    /// </summary>
    Task<DepreciationScheduleDto> PostDepreciationAsync(Guid scheduleId);

    /// <summary>
    /// Post all unposted depreciation schedules for a fiscal period
    /// </summary>
    Task<int> PostAllDepreciationAsync(Guid fiscalPeriodId);

    /// <summary>
    /// Reverse a posted depreciation schedule
    /// </summary>
    Task<DepreciationScheduleDto> ReverseDepreciationAsync(Guid scheduleId);

    /// <summary>
    /// Get depreciation summary for a fiscal period
    /// </summary>
    Task<DepreciationSummaryDto> GetDepreciationSummaryAsync(Guid fiscalPeriodId);

    /// <summary>
    /// Calculate depreciation amount for an asset by ID
    /// </summary>
    Task<decimal> CalculateDepreciationAmountAsync(Guid assetId, DateTime periodEndDate);

    /// <summary>
    /// Get depreciation forecast for an asset
    /// </summary>
    Task<List<DepreciationForecastDto>> GetDepreciationForecastAsync(Guid assetId, int months = 12);

    /// <summary>
    /// Delete unposted depreciation schedules for an asset
    /// </summary>
    Task DeleteUnpostedSchedulesAsync(Guid assetId);
}
