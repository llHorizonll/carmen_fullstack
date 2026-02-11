using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AR;

/// <summary>
/// Represents an accounts receivable invoice (customer invoice)
/// </summary>
public class ArInvoice : TenantEntity
{
    /// <summary>
    /// System-generated invoice number
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    /// <summary>
    /// Customer's reference number (external reference)
    /// </summary>
    public string? CustomerReference { get; set; }

    /// <summary>
    /// Invoice date
    /// </summary>
    public DateTime InvoiceDate { get; set; }

    /// <summary>
    /// Payment due date
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Invoice status
    /// </summary>
    public ArInvoiceStatus Status { get; set; } = ArInvoiceStatus.Draft;

    // Customer reference

    /// <summary>
    /// Customer ID
    /// </summary>
    public Guid CustomerId { get; set; }

    // Currency

    /// <summary>
    /// Currency code
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Exchange rate to base currency
    /// </summary>
    public decimal ExchangeRate { get; set; } = 1;

    // Amounts (before tax)

    /// <summary>
    /// Subtotal before taxes
    /// </summary>
    public decimal SubTotal { get; set; }

    // Three-tier tax structure

    /// <summary>
    /// Tax1 profile (VAT/GST)
    /// </summary>
    public Guid? Tax1ProfileId { get; set; }

    /// <summary>
    /// Tax1 amount (VAT/GST)
    /// </summary>
    public decimal Tax1Amount { get; set; }

    /// <summary>
    /// Tax2 profile (Service Tax)
    /// </summary>
    public Guid? Tax2ProfileId { get; set; }

    /// <summary>
    /// Tax2 amount (Service Tax)
    /// </summary>
    public decimal Tax2Amount { get; set; }

    /// <summary>
    /// Withholding Tax profile
    /// </summary>
    public Guid? WhtProfileId { get; set; }

    /// <summary>
    /// Withholding Tax amount
    /// </summary>
    public decimal WhtAmount { get; set; }

    // Final amounts

    /// <summary>
    /// Total amount (SubTotal + Tax1 + Tax2)
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Net amount receivable (TotalAmount - WHT)
    /// </summary>
    public decimal NetAmount { get; set; }

    /// <summary>
    /// Amount received so far
    /// </summary>
    public decimal PaidAmount { get; set; }

    /// <summary>
    /// Remaining balance (NetAmount - PaidAmount)
    /// </summary>
    public decimal BalanceAmount { get; set; }

    // Base currency amounts

    /// <summary>
    /// Subtotal in base currency
    /// </summary>
    public decimal SubTotalBase { get; set; }

    /// <summary>
    /// Total amount in base currency
    /// </summary>
    public decimal TotalAmountBase { get; set; }

    /// <summary>
    /// Net amount in base currency
    /// </summary>
    public decimal NetAmountBase { get; set; }

    // Payment terms

    /// <summary>
    /// Payment term ID
    /// </summary>
    public Guid? PaymentTermId { get; set; }

    // Description

    /// <summary>
    /// Invoice description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// External reference
    /// </summary>
    public string? Reference { get; set; }

    // Fiscal period

    /// <summary>
    /// Fiscal period ID
    /// </summary>
    public Guid FiscalPeriodId { get; set; }

    // Approval workflow

    /// <summary>
    /// Date/time when approved
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// User who approved
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Date/time when posted to GL
    /// </summary>
    public DateTime? PostedAt { get; set; }

    /// <summary>
    /// User who posted
    /// </summary>
    public string? PostedBy { get; set; }

    /// <summary>
    /// Rejection reason (if rejected)
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Void reason (if voided)
    /// </summary>
    public string? VoidReason { get; set; }

    // GL Journal Voucher link

    /// <summary>
    /// Linked Journal Voucher ID (when posted)
    /// </summary>
    public Guid? JournalVoucherId { get; set; }

    /// <summary>
    /// Default AR account for this invoice
    /// </summary>
    public Guid? ArAccountId { get; set; }

    // Navigation properties

    public virtual Customer Customer { get; set; } = null!;
    public virtual PaymentTerm? PaymentTerm { get; set; }
    public virtual TaxProfile? Tax1Profile { get; set; }
    public virtual TaxProfile? Tax2Profile { get; set; }
    public virtual TaxProfile? WhtProfile { get; set; }
    public virtual FiscalPeriod? FiscalPeriod { get; set; }
    public virtual JournalVoucher? JournalVoucher { get; set; }
    public virtual ChartOfAccount? ArAccount { get; set; }
    public virtual ICollection<ArInvoiceLine> Lines { get; set; } = new List<ArInvoiceLine>();
    public virtual ICollection<ArReceiptLine> ReceiptLines { get; set; } = new List<ArReceiptLine>();
}
