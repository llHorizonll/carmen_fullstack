using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.AP;

/// <summary>
/// Represents a payment allocation line (allocating payment to invoice)
/// </summary>
public class ApPaymentLine : TenantEntity
{
    /// <summary>
    /// Parent payment ID
    /// </summary>
    public Guid ApPaymentId { get; set; }

    /// <summary>
    /// Invoice being paid
    /// </summary>
    public Guid ApInvoiceId { get; set; }

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

    public virtual ApPayment ApPayment { get; set; } = null!;
    public virtual ApInvoice ApInvoice { get; set; } = null!;
}
