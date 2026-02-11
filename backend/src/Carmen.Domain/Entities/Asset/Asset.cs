using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.Asset;

/// <summary>
/// Represents a fixed asset record
/// </summary>
public class Asset : TenantEntity
{
    // Identification

    /// <summary>
    /// Unique asset code within the tenant
    /// </summary>
    public string AssetCode { get; set; } = string.Empty;

    /// <summary>
    /// Asset name (English/default)
    /// </summary>
    public string AssetName { get; set; } = string.Empty;

    /// <summary>
    /// Asset name in local language
    /// </summary>
    public string? AssetNameLocal { get; set; }

    /// <summary>
    /// Detailed description of the asset
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Serial number or manufacturer's number
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Barcode for physical tracking
    /// </summary>
    public string? Barcode { get; set; }

    // Classification

    /// <summary>
    /// Asset category ID
    /// </summary>
    public Guid AssetCategoryId { get; set; }

    /// <summary>
    /// Physical location description
    /// </summary>
    public string? LocationDescription { get; set; }

    /// <summary>
    /// Department that owns/uses the asset
    /// </summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>
    /// Physical condition of the asset
    /// </summary>
    public AssetCondition Condition { get; set; } = AssetCondition.New;

    // Acquisition information

    /// <summary>
    /// Date the asset was acquired
    /// </summary>
    public DateTime AcquisitionDate { get; set; }

    /// <summary>
    /// Original acquisition cost
    /// </summary>
    public decimal AcquisitionCost { get; set; }

    /// <summary>
    /// Currency of acquisition
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Exchange rate at acquisition (vs base currency)
    /// </summary>
    public decimal ExchangeRate { get; set; } = 1m;

    /// <summary>
    /// Acquisition cost in base currency
    /// </summary>
    public decimal AcquisitionCostBase { get; set; }

    /// <summary>
    /// Vendor the asset was purchased from (optional)
    /// </summary>
    public Guid? VendorId { get; set; }

    /// <summary>
    /// AP Invoice that created this asset (optional)
    /// </summary>
    public Guid? ApInvoiceId { get; set; }

    /// <summary>
    /// Purchase order or reference number
    /// </summary>
    public string? PurchaseReference { get; set; }

    // Depreciation settings

    /// <summary>
    /// Depreciation method for this asset
    /// </summary>
    public DepreciationMethod DepreciationMethod { get; set; } = DepreciationMethod.StraightLine;

    /// <summary>
    /// Useful life in months
    /// </summary>
    public int UsefulLifeMonths { get; set; } = 60;

    /// <summary>
    /// Salvage/residual value at end of useful life
    /// </summary>
    public decimal SalvageValue { get; set; }

    /// <summary>
    /// Date depreciation starts (may differ from acquisition date)
    /// </summary>
    public DateTime DepreciationStartDate { get; set; }

    /// <summary>
    /// Monthly depreciation amount (calculated)
    /// </summary>
    public decimal MonthlyDepreciation { get; set; }

    // Current values

    /// <summary>
    /// Current status of the asset
    /// </summary>
    public AssetStatus Status { get; set; } = AssetStatus.Active;

    /// <summary>
    /// Total accumulated depreciation
    /// </summary>
    public decimal AccumulatedDepreciation { get; set; }

    /// <summary>
    /// Current book value (AcquisitionCost - AccumulatedDepreciation)
    /// </summary>
    public decimal CurrentValue { get; set; }

    /// <summary>
    /// Number of months depreciation has been run
    /// </summary>
    public int DepreciatedMonths { get; set; }

    /// <summary>
    /// Whether the asset is fully depreciated
    /// </summary>
    public bool IsFullyDepreciated { get; set; }

    // GL Accounts (can override category defaults)

    /// <summary>
    /// Asset account (Fixed Asset)
    /// </summary>
    public Guid? AssetAccountId { get; set; }

    /// <summary>
    /// Accumulated depreciation account (Contra Asset)
    /// </summary>
    public Guid? AccumDepreciationAccountId { get; set; }

    /// <summary>
    /// Depreciation expense account
    /// </summary>
    public Guid? DepreciationExpenseAccountId { get; set; }

    // Disposal tracking

    /// <summary>
    /// Date the asset was disposed
    /// </summary>
    public DateTime? DisposedAt { get; set; }

    /// <summary>
    /// Value received on disposal (if any)
    /// </summary>
    public decimal? DisposalValue { get; set; }

    /// <summary>
    /// Gain or loss on disposal
    /// </summary>
    public decimal? GainLossAmount { get; set; }

    /// <summary>
    /// Additional notes
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual AssetCategory AssetCategory { get; set; } = null!;
    public virtual Department? Department { get; set; }
    public virtual Vendor? Vendor { get; set; }
    public virtual ApInvoice? ApInvoice { get; set; }
    public virtual ChartOfAccount? AssetAccount { get; set; }
    public virtual ChartOfAccount? AccumDepreciationAccount { get; set; }
    public virtual ChartOfAccount? DepreciationExpenseAccount { get; set; }
    public virtual ICollection<DepreciationSchedule> DepreciationSchedules { get; set; } = new List<DepreciationSchedule>();
    public virtual AssetDisposal? Disposal { get; set; }
}
