using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.Asset;

/// <summary>
/// Represents a depreciation schedule entry for an asset
/// </summary>
public class DepreciationSchedule : TenantEntity
{
    /// <summary>
    /// Asset this schedule belongs to
    /// </summary>
    public Guid AssetId { get; set; }

    /// <summary>
    /// Fiscal period for this depreciation
    /// </summary>
    public Guid FiscalPeriodId { get; set; }

    /// <summary>
    /// Sequence number within the asset's depreciation schedule
    /// </summary>
    public int ScheduleNumber { get; set; }

    /// <summary>
    /// Schedule date (typically end of period)
    /// </summary>
    public DateTime ScheduleDate { get; set; }

    /// <summary>
    /// Book value at the start of this period
    /// </summary>
    public decimal OpeningValue { get; set; }

    /// <summary>
    /// Depreciation amount for this period
    /// </summary>
    public decimal DepreciationAmount { get; set; }

    /// <summary>
    /// Depreciation amount in base currency
    /// </summary>
    public decimal DepreciationAmountBase { get; set; }

    /// <summary>
    /// Book value at the end of this period
    /// </summary>
    public decimal ClosingValue { get; set; }

    /// <summary>
    /// Cumulative depreciation up to and including this period
    /// </summary>
    public decimal AccumulatedDepreciation { get; set; }

    /// <summary>
    /// Whether this schedule has been posted to GL
    /// </summary>
    public bool IsPosted { get; set; }

    /// <summary>
    /// Journal voucher ID when posted
    /// </summary>
    public Guid? JournalVoucherId { get; set; }

    /// <summary>
    /// Date/time when posted to GL
    /// </summary>
    public DateTime? PostedAt { get; set; }

    /// <summary>
    /// User who posted to GL
    /// </summary>
    public string? PostedBy { get; set; }

    /// <summary>
    /// Notes for this schedule entry
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual Asset Asset { get; set; } = null!;
    public virtual FiscalPeriod FiscalPeriod { get; set; } = null!;
    public virtual JournalVoucher? JournalVoucher { get; set; }
}
