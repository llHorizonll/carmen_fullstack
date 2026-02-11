using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.Configuration;

/// <summary>
/// Tax type enumeration
/// </summary>
public enum TaxType
{
    /// <summary>Value Added Tax (VAT)</summary>
    VAT = 1,
    /// <summary>Goods and Services Tax (GST)</summary>
    GST = 2,
    /// <summary>Sales Tax</summary>
    SalesTax = 3,
    /// <summary>Service Tax</summary>
    ServiceTax = 4,
    /// <summary>Withholding Tax</summary>
    WithholdingTax = 5,
    /// <summary>Other Tax</summary>
    Other = 99
}

/// <summary>
/// Tax calculation method
/// </summary>
public enum TaxCalculationMethod
{
    /// <summary>Percentage of base amount</summary>
    Percentage = 1,
    /// <summary>Fixed amount per unit</summary>
    FixedAmount = 2
}

/// <summary>
/// Represents a tax profile configuration
/// </summary>
public class TaxProfile : TenantEntity
{
    public string TaxCode { get; set; } = string.Empty;
    public string TaxName { get; set; } = string.Empty;
    public string? TaxNameLocal { get; set; }
    public TaxType TaxType { get; set; } = TaxType.VAT;
    public TaxCalculationMethod CalculationMethod { get; set; } = TaxCalculationMethod.Percentage;
    public decimal TaxRate { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; }

    /// <summary>
    /// GL Account for tax payable (liability account)
    /// </summary>
    public Guid? TaxPayableAccountId { get; set; }

    /// <summary>
    /// GL Account for tax receivable (asset account)
    /// </summary>
    public Guid? TaxReceivableAccountId { get; set; }

    /// <summary>
    /// Display order for sorting
    /// </summary>
    public int SortOrder { get; set; }

    // Navigation properties
    public virtual ChartOfAccount? TaxPayableAccount { get; set; }
    public virtual ChartOfAccount? TaxReceivableAccount { get; set; }
}
