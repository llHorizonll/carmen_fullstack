using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.Asset;

/// <summary>
/// Represents an asset disposal/retirement record
/// </summary>
public class AssetDisposal : TenantEntity
{
    /// <summary>
    /// Asset being disposed
    /// </summary>
    public Guid AssetId { get; set; }

    /// <summary>
    /// Date of disposal
    /// </summary>
    public DateTime DisposalDate { get; set; }

    /// <summary>
    /// Method of disposal
    /// </summary>
    public DisposalMethod DisposalMethod { get; set; }

    /// <summary>
    /// Proceeds from disposal (sale price, if any)
    /// </summary>
    public decimal DisposalValue { get; set; }

    /// <summary>
    /// Costs associated with disposal
    /// </summary>
    public decimal DisposalCost { get; set; }

    /// <summary>
    /// Net proceeds (DisposalValue - DisposalCost)
    /// </summary>
    public decimal NetProceeds { get; set; }

    /// <summary>
    /// Book value of the asset at time of disposal
    /// </summary>
    public decimal BookValueAtDisposal { get; set; }

    /// <summary>
    /// Accumulated depreciation at time of disposal
    /// </summary>
    public decimal AccumulatedDepreciationAtDisposal { get; set; }

    /// <summary>
    /// Gain or loss on disposal (NetProceeds - BookValueAtDisposal)
    /// Positive = gain, Negative = loss
    /// </summary>
    public decimal GainLossAmount { get; set; }

    /// <summary>
    /// Name of buyer (if sold)
    /// </summary>
    public string? BuyerName { get; set; }

    /// <summary>
    /// Reference number for the disposal
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// Reason for disposal
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Additional notes
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Whether the disposal has been posted to GL
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
    /// User who approved the disposal
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Date/time when approved
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    // Navigation properties

    public virtual Asset Asset { get; set; } = null!;
    public virtual JournalVoucher? JournalVoucher { get; set; }
}
