using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.Asset;

/// <summary>
/// Represents an asset category with default settings for depreciation
/// </summary>
public class AssetCategory : TenantEntity
{
    /// <summary>
    /// Unique category code within the tenant
    /// </summary>
    public string CategoryCode { get; set; } = string.Empty;

    /// <summary>
    /// Category name (English/default)
    /// </summary>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// Category name in local language
    /// </summary>
    public string? CategoryNameLocal { get; set; }

    /// <summary>
    /// Description of the category
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Whether the category is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Default depreciation settings

    /// <summary>
    /// Default useful life in months for assets in this category
    /// </summary>
    public int DefaultUsefulLifeMonths { get; set; } = 60;

    /// <summary>
    /// Default depreciation method
    /// </summary>
    public DepreciationMethod DefaultDepreciationMethod { get; set; } = DepreciationMethod.StraightLine;

    /// <summary>
    /// Default salvage value percentage (0-100)
    /// </summary>
    public decimal DefaultSalvagePercent { get; set; }

    // Default GL accounts

    /// <summary>
    /// Default asset account (Fixed Asset)
    /// </summary>
    public Guid? DefaultAssetAccountId { get; set; }

    /// <summary>
    /// Default accumulated depreciation account (Contra Asset)
    /// </summary>
    public Guid? DefaultAccumDepreciationAccountId { get; set; }

    /// <summary>
    /// Default depreciation expense account
    /// </summary>
    public Guid? DefaultDepreciationExpenseAccountId { get; set; }

    /// <summary>
    /// Default gain/loss on disposal account
    /// </summary>
    public Guid? DefaultGainLossAccountId { get; set; }

    /// <summary>
    /// Code prefix for auto-generating asset codes
    /// </summary>
    public string? AssetCodePrefix { get; set; }

    /// <summary>
    /// Notes/remarks about the category
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual ChartOfAccount? DefaultAssetAccount { get; set; }
    public virtual ChartOfAccount? DefaultAccumDepreciationAccount { get; set; }
    public virtual ChartOfAccount? DefaultDepreciationExpenseAccount { get; set; }
    public virtual ChartOfAccount? DefaultGainLossAccount { get; set; }
    public virtual ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
