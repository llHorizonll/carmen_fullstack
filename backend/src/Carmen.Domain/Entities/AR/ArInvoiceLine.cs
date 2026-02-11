using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AR;

/// <summary>
/// Represents a line item in an AR invoice
/// </summary>
public class ArInvoiceLine : TenantEntity
{
    /// <summary>
    /// Parent invoice ID
    /// </summary>
    public Guid ArInvoiceId { get; set; }

    /// <summary>
    /// Line number (1-based)
    /// </summary>
    public int LineNumber { get; set; }

    /// <summary>
    /// Revenue account ID
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Line description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Quantity
    /// </summary>
    public decimal Quantity { get; set; } = 1;

    /// <summary>
    /// Unit of measure
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Unit price
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Line amount (Quantity * UnitPrice)
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Line amount in base currency
    /// </summary>
    public decimal AmountBase { get; set; }

    /// <summary>
    /// Discount percentage
    /// </summary>
    public decimal DiscountPercent { get; set; }

    /// <summary>
    /// Discount amount
    /// </summary>
    public decimal DiscountAmount { get; set; }

    /// <summary>
    /// Net amount after discount
    /// </summary>
    public decimal NetAmount { get; set; }

    // Line-level tax (optional override)

    /// <summary>
    /// Tax1 profile ID (line-level override)
    /// </summary>
    public Guid? Tax1ProfileId { get; set; }

    /// <summary>
    /// Tax1 amount for this line
    /// </summary>
    public decimal Tax1Amount { get; set; }

    // Cost center / Department

    /// <summary>
    /// Department/cost center ID
    /// </summary>
    public Guid? DepartmentId { get; set; }

    /// <summary>
    /// Project reference
    /// </summary>
    public string? ProjectCode { get; set; }

    // Navigation properties

    public virtual ArInvoice ArInvoice { get; set; } = null!;
    public virtual ChartOfAccount Account { get; set; } = null!;
    public virtual TaxProfile? Tax1Profile { get; set; }
    public virtual Department? Department { get; set; }
}
