using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.AR;

/// <summary>
/// Represents a receipt allocation line (allocating receipt to invoice)
/// </summary>
public class ArReceiptLine : TenantEntity
{
    /// <summary>
    /// Parent receipt ID
    /// </summary>
    public Guid ArReceiptId { get; set; }

    /// <summary>
    /// Invoice being paid
    /// </summary>
    public Guid ArInvoiceId { get; set; }

    /// <summary>
    /// Line number (1-based)
    /// </summary>
    public int LineNumber { get; set; }

    /// <summary>
    /// Amount allocated to this invoice
    /// </summary>
    public decimal AmountAllocated { get; set; }

    /// <summary>
    /// Amount allocated in base currency
    /// </summary>
    public decimal AmountAllocatedBase { get; set; }

    /// <summary>
    /// Early payment discount taken
    /// </summary>
    public decimal DiscountAmount { get; set; }

    /// <summary>
    /// Withholding tax amount
    /// </summary>
    public decimal WhtAmount { get; set; }

    /// <summary>
    /// Exchange gain/loss on this allocation
    /// </summary>
    public decimal ExchangeGainLoss { get; set; }

    /// <summary>
    /// Notes for this allocation
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual ArReceipt ArReceipt { get; set; } = null!;
    public virtual ArInvoice ArInvoice { get; set; } = null!;
}
