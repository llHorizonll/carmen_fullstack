using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Domain.Entities.GL;

namespace Carmen.Application.Services.GL;

public interface IFiscalPeriodService
{
    // Fiscal Year operations

    /// <summary>
    /// Get all fiscal years
    /// </summary>
    Task<List<FiscalYearListDto>> GetFiscalYearsAsync();

    /// <summary>
    /// Get fiscal year by ID
    /// </summary>
    Task<FiscalYearDto?> GetFiscalYearByIdAsync(Guid id);

    /// <summary>
    /// Create a new fiscal year with periods
    /// </summary>
    Task<FiscalYearDto> CreateFiscalYearAsync(CreateFiscalYearRequest request);

    // Fiscal Period operations

    /// <summary>
    /// Get paginated list of fiscal periods
    /// </summary>
    Task<PaginatedResult<FiscalPeriodListDto>> GetPeriodsAsync(FiscalPeriodQueryParams query);

    /// <summary>
    /// Get fiscal period by ID
    /// </summary>
    Task<FiscalPeriodDto?> GetPeriodByIdAsync(Guid id);

    /// <summary>
    /// Get periods for lookup (dropdown)
    /// </summary>
    Task<List<FiscalPeriodLookupDto>> GetPeriodLookupAsync(Guid? fiscalYearId = null, bool openOnly = false);

    /// <summary>
    /// Get current open period (for default selection)
    /// </summary>
    Task<FiscalPeriodDto?> GetCurrentPeriodAsync();

    /// <summary>
    /// Find period by date
    /// </summary>
    Task<FiscalPeriodDto?> GetPeriodByDateAsync(DateTime date);

    // Period Closing operations

    /// <summary>
    /// Validate if a period can be closed
    /// </summary>
    Task<PeriodCloseValidationResult> ValidatePeriodCloseAsync(Guid periodId);

    /// <summary>
    /// Get vouchers blocking period close
    /// </summary>
    Task<PeriodBlockingVouchersDto> GetBlockingVouchersAsync(Guid periodId);

    /// <summary>
    /// Close a fiscal period
    /// </summary>
    Task<FiscalPeriodDto> ClosePeriodAsync(Guid periodId, ClosePeriodRequest request);

    /// <summary>
    /// Reopen a closed fiscal period (not locked)
    /// </summary>
    Task<FiscalPeriodDto> ReopenPeriodAsync(Guid periodId, ReopenPeriodRequest request);

    /// <summary>
    /// Lock a fiscal period permanently
    /// </summary>
    Task<FiscalPeriodDto> LockPeriodAsync(Guid periodId);
}
